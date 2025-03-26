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
const twilio = require('twilio');

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
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
router.post(
  '/login',
  authLimiter,
  [
    body('username').notEmpty().withMessage('Username or Email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password } = req.body;

      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

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

// Update profile
router.put('/update-profile',authMiddleware,[
    body('email').optional().isEmail(),
    body('fullName').optional().trim().escape()
  ],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
    try{
      const updates={};
      const {email,fullName}=req.body;
      if(email) updates.email=email;
      if(fullName) updates.fullName=fullName;
      await User.findByIdAndUpdate(req.userId,updates);
      res.json({message:'Profile updated successfully'});
    }catch(err){
      console.error(err);
      res.status(500).json({error:'Server error'});
    }
  });
  
  // Change password
  router.put('/change-password',authMiddleware,[
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({min:8})
  ],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
    try{
      const {currentPassword,newPassword}=req.body;
      const user=await User.findById(req.userId);
      const isMatch=await bcrypt.compare(currentPassword,user.password);
      if(!isMatch) return res.status(400).json({error:'Current password is incorrect'});
      const hashedNew=await bcrypt.hash(newPassword,10);
      user.password=hashedNew;
      await user.save();
      res.json({message:'Password changed successfully'});
    }catch(err){
      console.error(err);
      res.status(500).json({error:'Server error'});
    }
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
  

  
  // Generate OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send OTP
  router.post('/send-otp', [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
  ], async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      // Check existing user
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
  
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
      // Save OTP to database
      await OTPVerification.create({ 
        phoneNumber, 
        otp, 
        expiresAt 
      });
  
      // Send OTP via Twilio
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: phoneNumber
      });
  
      res.json({ 
        success: true,
        message: 'OTP sent successfully' 
      });
    } catch (error) {
      console.error('OTP send error:', error);
      
      // Handle Twilio-specific errors
      if (error.code === 21211) {
        return res.status(400).json({ error: 'Invalid phone number' });
      }
      if (error.code === 21614) {
        return res.status(400).json({ error: 'Phone number not SMS-capable' });
      }
      
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });
  // Verify OTP and Signup
  router.post('/signup-with-otp', [
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
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP format'),
    body('phoneNumber').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format')
  ], async (req, res) => {
    try {
      console.log('Signup request received:', req.body);
      
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }

      const { email, phoneNumber, otp, username, fullName, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email },
          { username },
          ...(phoneNumber ? [{ phoneNumber }] : [])
        ]
      });

      if (existingUser) {
        console.log('User already exists:', existingUser);
        return res.status(400).json({
          error: 'User already exists',
          details: {
            field: existingUser.email === email ? 'email' :
                   existingUser.username === username ? 'username' : 'phoneNumber',
            message: 'This value is already registered'
          }
        });
      }

      // Find and validate OTP
      const otpRecord = await OTPVerification.findOne({ 
        $or: [{ phoneNumber }],
        otp,
        purpose: 'signup'
      });

      if (!otpRecord) {
        console.log('OTP not found');
        return res.status(400).json({ 
          error: 'Invalid OTP',
          details: { field: 'otp', message: 'The OTP you entered is incorrect' }
        });
      }

      if (otpRecord.expiresAt < new Date()) {
        console.log('OTP expired');
        return res.status(400).json({ 
          error: 'Expired OTP',
          details: { field: 'otp', message: 'The OTP has expired. Please request a new one' }
        });
      }

      // Create user
      console.log('Creating user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      const user = new User({
        email,
        phoneNumber,
        username,
        fullName,
        password: hashedPassword,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: `Welcome to my profile! I'm ${fullName}.`
      });

      await user.save();
      console.log('User created:', user);

      // Clean up OTP record
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      console.log('OTP record deleted');

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      console.log('Token generated');

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return user data (excluding sensitive information)
      const userResponse = {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt
      };

      console.log('Signup complete');
      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
      
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      });
    }
  });

module.exports = router;
