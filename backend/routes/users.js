const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const pick = require('lodash.pick');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// Helper function to validate MongoDB ID
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   GET /api/users/user/:userId
// @desc    Get user profile and posts
// @access  Private
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Validate userId parameter
    if (!isValidObjectId(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Get user profile
    const user = await User.findById(req.params.userId)
      .select('-password -__v -refreshTokens')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user posts with visibility check
    const posts = await Post.find({
      userId: req.params.userId,
      $or: [
        { visibility: 'public' },
        { 
          visibility: 'private', 
          authorizedUsers: { $in: [req.userId] } // Using req.userId from authMiddleware
        }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    // Add follow status
    const isFollowing = user.followers.includes(req.userId);
    const profileData = {
      ...user,
      postsCount: posts.length,
      isFollowing,
      posts
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/visibility
// @desc    Update profile visibility
// @access  Private
router.put('/visibility', authMiddleware, async (req, res) => {
  try {
    const { profileVisibility } = req.body;
    
    if (!['public', 'private'].includes(profileVisibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $set: { 
          'privacySettings.profileVisibility': profileVisibility 
        } 
      },
      { 
        new: true,
        select: '-password -__v -refreshTokens'
      }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Visibility updated successfully',
      profileVisibility: user.privacySettings.profileVisibility
    });
  } catch (error) {
    console.error('Visibility update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/update
// @desc    Update user profile
// @access  Private
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 
      'username', 
      'bio', 
      'website', 
      'email',
      'profileImage',
      'privacySettings'
    ];

    const updates = pick(req.body, allowedFields);

    // Validate username uniqueness
    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && !existingUser._id.equals(req.userId)) { // Using req.userId
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Validate email uniqueness
    if (updates.email) {
      const existingEmail = await User.findOne({ email: updates.email });
      if (existingEmail && !existingEmail._id.equals(req.userId)) { // Using req.userId
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.userId, // Using req.userId from authMiddleware
      { $set: updates },
      { 
        new: true, 
        runValidators: true,
        select: '-password -__v -refreshTokens' 
      }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId) // Using req.userId
      .select('-password -__v -refreshTokens')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;