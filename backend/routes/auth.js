const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const OTPVerification = require('../models/OTPVerification');
const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  message: 'Too many requests from this IP, please try again later'
});

// Signup route with rate limiting and input validation
router.post(
  '/signup',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('fullName').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, username, password, fullName } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      const user = new User({ email, username, password, fullName });
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000
      });

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
 // Login route with rate limiting and input validation
// router.post(
//   '/login',
//   authLimiter,
//   [
//     body('username').notEmpty().withMessage('Username or Email is required'),
//     body('password').notEmpty().withMessage('Password is required')
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     try {
//       const { username, password } = req.body;

//       const user = await User.findOne({
//         $or: [{ username }, { email: username }]
//       });
//       console.log("username input:", username);
// console.log("User found:", user);
// if (user) {
//   console.log("Stored hash:", user.password);
//   console.log("Input password:", password);
//   const match = await bcrypt.compare(password, user.password);
//   console.log("Password match:", match);
// }
//       if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

//       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 604800000
//       });

//       res.json({ message: 'Logged in successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   }
// );

// Add to auth routes
router.post(
  '/verify-2fa',
  authLimiter,
  [
    body('username').notEmpty(),
    body('otp').isLength(6)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, otp } = req.body;
      
      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      }).select('+verification.twoFactorEnabled');

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      if (!user.verification.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA not enabled for this account' });
      }

      const otpRecord = await OTPVerification.findOne({
        email: user.email,
        otp,
        purpose: '2fa'
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Generate final token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      // Set cookie and cleanup OTP
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000
      });

      await OTPVerification.deleteOne({ _id: otpRecord._id });
      
      // // Update login history
      // await User.findByIdAndUpdate(user._id, {
      //   $push: {
      //     loginHistory: {
      //       ip: req.ip,
      //       device: req.headers['user-agent'],
      //       location: req.geo.location,
      //       timestamp: new Date()
      //     }
      //   },
      //   lastActive: new Date()
      // });

      res.json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Modified login route
router.post(
  '/login',
  authLimiter,
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password } = req.body;
      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      }).select('+password +verification.twoFactorEnabled');

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      if (user.status !== 'active') return res.status(403).json({ error: 'Account suspended' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      // Check if 2FA is enabled
      if (user.verification.twoFactorEnabled) {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTPVerification.create({
          email: user.email,
          otp,
          expiresAt,
          purpose: '2fa'
        });

        // Send OTP email
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'Your 2FA Verification Code',
          text: `Your verification code is: ${otp}`
        });

        return res.status(202).json({ 
          message: '2FA required', 
          otpRequired: true,
          email: user.email.slice(0, 3) + '***' + user.email.split('@')[1]
        });
      }

      // Regular login flow
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000
      });

      res.json({ message: 'Logged in successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -__v').lean();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});
  
  // Delete account
  router.delete('/delete-account',authMiddleware,async (req,res)=>{
    try{
      await User.findByIdAndDelete(req.userId);
      res.clearCookie('token');
      res.json({message:'Account deleted successfully'});
    }catch(err){
      console.error(err);
      res.status(500).json({error:'Server error'});
    }
  });
  
  // Refresh token route (optional)
  router.post('/refresh-token',authMiddleware,(req,res)=>{
    try{
      const token=jwt.sign({userId:req.userId},process.env.JWT_SECRET,{expiresIn:'7d'});
      res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'strict',
        maxAge:604800000
      });
      res.json({message:'Token refreshed'});
    }catch(err){
      console.error(err);
      res.status(500).json({error:'Server error'});
    }
  });
  
  router.post(
    '/send-otp',
    authLimiter,
    [
      body('email').isEmail().withMessage('Valid email is required')
    ],
    async (req, res) => {
      try {
        const { email } = req.body;
        
        // Optional: Check if user already exists if you want to restrict OTP to new signups
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already registered' });
        }
  
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
  
        // Save OTP record with email and purpose tag (e.g., 'signup')
        await OTPVerification.create({
          email,
          otp,
          expiresAt,
          purpose: 'signup'
        });
  
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
  
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Your OTP for SocialSphere Signup',
          text: `Your OTP is: ${otp}`
        };
  
        await transporter.sendMail(mailOptions);
  
        res.json({ success: true, message: 'OTP sent successfully. Please check your email.' });
      } catch (error) {
        console.error('OTP send error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
      }
    }
  );
  
 // Verify OTP and Signup (email OTP only)
router.post(
  '/signup-with-otp',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('username')
      .isLength({ min: 6 })
      .withMessage('Username must be at least 6 characters long')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      .withMessage('Password must contain an uppercase letter, a number, and a special character'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP format')
  ],
  async (req, res) => {
    try {
      console.log('🚀 Signup request received with data:', req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }

      const { email, otp, username, fullName, password } = req.body;

      console.log('🔍 Checking if user already exists...');
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        console.log('⚠️ User already exists:', existingUser);
        return res.status(400).json({
          error: 'User already exists',
          details: {
            field: existingUser.email === email ? 'email' : 'username',
            message: 'This value is already registered'
          }
        });
      }

      console.log('🔍 Looking up OTP record...');
      const otpRecord = await OTPVerification.findOne({
        email,
        otp,
        purpose: 'signup'
      });

      if (!otpRecord) {
        console.log('❌ OTP not found for email:', email);
        return res.status(400).json({
          error: 'Invalid OTP',
          details: { field: 'otp', message: 'The OTP you entered is incorrect' }
        });
      }

      if (otpRecord.expiresAt < new Date()) {
        console.log('⏰ OTP expired for email:', email);
        return res.status(400).json({
          error: 'Expired OTP',
          details: { field: 'otp', message: 'The OTP has expired. Please request a new one' }
        });
      }

      // console.log('🔐 Hashing password...');
      // const hashedPassword = await bcrypt.hash(password, 10);
      // console.log('✅ Password hashed');

      console.log('👤 Creating new user...');
      const user = new User({
        email,
        username,
        fullName,
        password: password,
        verification: { emailVerified: true },
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: `Welcome to my profile! I'm ${fullName}.`
      });

      await user.save();
      console.log('✅ User saved in DB with ID:', user._id);

      await OTPVerification.deleteOne({ _id: otpRecord._id });
      console.log('🧹 OTP record deleted for email:', email);

      console.log('🔐 Generating JWT token...');
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      console.log('🍪 Token cookie set');

      const userResponse = {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt
      };

      console.log('🎉 Signup complete, returning response');
      return res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('🔥 Signup error:', error);
      return res.status(500).json({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      });
    }
  }
);
// Send OTP for password reset (public)
router.post('/send-password-reset-otp',
  authLimiter,
  [
    body('username').notEmpty().withMessage('Username or Email is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username } = req.body;
      const user = await User.findOne({
        $or: [{ email: username }, { username: username }]
      });
      
      if (!user) return res.status(404).json({ error: 'User not found' });

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await OTPVerification.create({
        email: user.email,
        otp,
        expiresAt,
        purpose: 'password_reset'
      });

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`
      });

      res.json({ success: true, message: 'OTP sent to registered email' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
);

// Reset Password with OTP (public)
router.post('/reset-password',
  authLimiter,
  [
    body('username').notEmpty(),
    body('otp').isLength(6),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, otp, newPassword } = req.body;
      const user = await User.findOne({
        $or: [{ email: username }, { username: username }]
      });
      
      if (!user) return res.status(404).json({ error: 'User not found' });

      const otpRecord = await OTPVerification.findOne({
        email: user.email,
        otp,
        purpose: 'password_reset'
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
      user.password = newPassword;
      await user.save();

      await OTPVerification.deleteOne({ _id: otpRecord._id });
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Password reset failed' });
    }
  }
);

// Send OTP for password change (authenticated)
router.post('/send-password-change-otp',
  authMiddleware,
  authLimiter,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await OTPVerification.create({
        email: user.email,
        otp,
        expiresAt,
        purpose: 'password_change'
      });

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Change OTP',
        text: `Your OTP for password change is: ${otp}`
      });

      res.json({ success: true, message: 'OTP sent to registered email' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
);

// Update existing change password route to include OTP
router.put('/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    body('otp').isLength(6)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { currentPassword, newPassword, otp } = req.body;
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

      const otpRecord = await OTPVerification.findOne({
        email: user.email,
        otp,
        purpose: 'password_change'
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const hashedNew = await bcrypt.hash(newPassword, 10);
      user.password = hashedNew;
      await user.save();

      await OTPVerification.deleteOne({ _id: otpRecord._id });
      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
module.exports = router;
