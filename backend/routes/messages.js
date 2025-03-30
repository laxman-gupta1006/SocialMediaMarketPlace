const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');


// @route   GET /api/messages/user-info
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

// ✅ FIXED: Add `/my-following` route
router.get('/my-following', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 📌 Get chat names and participant usernames for the authenticated user
router.get('/my-chats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Authenticated user's ID

    // Find chats where the user's ID exists in the participants array
    const chats = await Chat.find({ participants: userId }).select('name participants').lean();

    if (!chats.length) {
      return res.status(404).json({ error: 'No matching chats found' });
    }

    // Extract unique participant IDs excluding the authenticated user
    const participantIds = chats.flatMap(chat => 
      chat.participants.filter(id => id.toString() !== userId)
    );

    // Fetch user details for the participants
    const users = await User.find({ _id: { $in: participantIds } }).select('username').lean();

    // Convert users to a lookup map for quick access
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.username;
      return acc;
    }, {});

    // Format the final response
    const chatData = chats.map(chat => ({
      chatName: chat.name,
      participants: chat.participants
        .filter(id => id.toString() !== userId)
        .map(id => ({
          userId: id,
          username: userMap[id.toString()] || 'Unknown User'
        }))
    }));

    res.json({ chats: chatData });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// ✅ FIXED: Ensure `module.exports = router`
module.exports = router;
