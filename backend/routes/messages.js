const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET /api/users/user-info
// @desc    Get authenticated user's ID and username
// @access  Private
router.get('/user-info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userId: req.userId, username: user.username });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/my-following
// @desc    Get list of users the authenticated user is following
// @access  Private
router.get('/my-following', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'following',
      select: 'username fullName profileImage' // Fetch only necessary fields
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ error: 'Failed to fetch following list' });
  }
});


module.exports = router;
