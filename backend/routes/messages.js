const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// ✅ Get authenticated user's ID and username
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

// ✅ Get list of users the authenticated user follows
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

// ✅ Get chat list with participant names (excluding self)
router.get('/my-chats', authMiddleware, async (req, res) => {
  try {
    console.log('🔹 Fetching chats for user:', req.userId);

    const userId = req.userId;
    const chats = await Chat.find({ participants: userId }).select('participants').lean();

    if (!chats.length) {
      console.log('❌ No chats found for user:', userId);
      return res.status(404).json({ error: 'No matching chats found' });
    }

    console.log('✅ Found chats:', chats);

    // Extract participant IDs excluding the authenticated user
    const participantIds = chats.flatMap(chat => 
      chat.participants.filter(id => id.toString() !== userId)
    );

    console.log('📝 Other participants:', participantIds);

    // Fetch user details for the participants
    const users = await User.find({ _id: { $in: participantIds } }).select('username').lean();

    // Convert users to a lookup map for quick access
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.username;
      return acc;
    }, {});

    console.log('📌 User mapping:', userMap);

    // Format the final response
    const chatData = chats.map(chat => ({
      chatId: chat._id,
      participant: chat.participants
        .filter(id => id.toString() !== userId)
        .map(id => ({
          userId: id,
          username: userMap[id.toString()] || 'Unknown User'
        }))[0] // Get the first participant (other than self)
    }));

    console.log('📨 Final chat data:', chatData);

    res.json({ chats: chatData });
  } catch (error) {
    console.error('❌ Error fetching user chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ Get chat ID between two users
router.get('/get-chat-id', authMiddleware, async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    const chat = await Chat.findOne({
      participants: { $all: [user1, user2] }
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ chatId: chat._id });
  } catch (error) {
    console.error("Error fetching chat ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get messages for a specific chat ID
router.get('/get-messages', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.query;

    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Send a new message
router.post('/send-message', authMiddleware, async (req, res) => {
  try {
    const { chatId, text, attachments } = req.body;
    const sender = req.userId;

    if (!chatId || !text) {
      return res.status(400).json({ error: "Chat ID and text are required" });
    }

    const newMessage = new Message({
      chatId,
      sender,
      text,
      attachments: attachments || [],
      timestamp: new Date(),
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Export the router
module.exports = router;
