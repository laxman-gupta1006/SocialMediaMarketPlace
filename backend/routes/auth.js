const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

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
  

module.exports = router;
