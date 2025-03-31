const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const mongoose = require("mongoose"); // Ensure mongoose is imported

// ✅ Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts/"); // Save files to this directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = uuidv4() + ext; // Rename file with UUID
    cb(null, fileName);
  }
});

// ✅ File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Get authenticated user's ID and username
router.get("/user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("username");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ userId: req.userId, username: user.username });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get list of users the authenticated user follows
router.get("/my-following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get chat list with participant names (excluding self)
// ✅ Get chat list with participant names (excluding self)
router.get("/my-chats", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Authenticated user's ID
    console.log("🟢 Logged-in User ID:", userId);

    // Fetch all chats where the user is a participant
    const chats = await Chat.find({ participants: userId })
      .select("participants name isGroup")
      .lean();

    console.log("📌 Retrieved Chats:", chats);

    if (!chats.length) {
      return res.status(200).json({ chats: [] }); // No chats found
    }

    // Get unique participant IDs (excluding the user itself)
    const allParticipantIds = [...new Set(chats.flatMap(chat => chat.participants))];

    console.log("🔍 Fetching user data for participant IDs:", allParticipantIds);

    // Fetch usernames and profile images for all participants
    const users = await User.find({ _id: { $in: allParticipantIds } })
      .select("_id username profileImage")
      .lean();

    console.log("✅ Retrieved User Data:", users);

    // Create a user lookup map
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    console.log("🗺️ User Mapping:", userMap);

    // Constructing chat data
    const chatData = chats.map(chat => {
      console.log(`🔄 Processing Chat: ${chat._id}`);
      console.log("👥 Participants:", chat.participants);

      // Identify the other participant by excluding the logged-in user
      const otherParticipantId = chat.participants.find(id => id.toString() !== userId);

      console.log("🆚 Other Participant ID:", otherParticipantId);

      // Get the other participant's details
      const otherParticipant = userMap[otherParticipantId?.toString()];

      console.log("🆚 Selected Other Participant:", otherParticipant);

      return {
        chatId: chat._id,
        name: chat.isGroup
          ? chat.name
          : (otherParticipant?.username || "Unknown User"),
        avatar: chat.isGroup
          ? ""
          : (otherParticipant?.profileImage || "/default-profile.png"),
        isGroup: chat.isGroup,
        participants: chat.participants.map(id => ({
          userId: id.toString(),
          username: userMap[id.toString()]?.username || "Unknown User",
          profileImage: userMap[id.toString()]?.profileImage || "/default-profile.png",
        }))
      };
    });

    console.log("✅ Final Chat Data:", chatData);

    res.json({ chats: chatData });
  } catch (error) {
    console.error("❌ Error fetching user chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});







// ✅ Get chat ID between two users
router.get("/get-chat-id", authMiddleware, async (req, res) => {
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
router.get("/get-messages", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.query;

    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Send a new message (Supports text & image uploads)
router.post("/send-message", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("Received message data:", req.body); // 🔍 Debug log

    const { chatId, text, type } = req.body;  // Extract `type`
    const sender = req.userId;

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    let messageData = {
      chatId,
      sender,
      timestamp: new Date(),
      type,  // ✅ Ensure type is included
    };

    if (req.file) {
      messageData.text = `/uploads/posts/${req.file.filename}`;
      messageData.type = "picture"; // ✅ Override type for images
    } else {
      if (!text) {
        return res.status(400).json({ error: "Text message cannot be empty." });
      }
      messageData.text = text;
    }

    const newMessage = await Message.create(messageData);
    res.status(201).json({ success: true, newMessage });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Export the router
module.exports = router;
