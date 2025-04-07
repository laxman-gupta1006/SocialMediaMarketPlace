const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const forge = require("node-forge");
const crypto = require("crypto");

// ✅ Use getIO from socket.js (not server.js anymore)
const { getIO } = require("../socket");

const userSymmetricKeys = {}; // { userId: { key: <rawKey>, timestamp: <timestamp> } }


router.post("/exchange-key", authMiddleware, (req, res) => {
  try {
    const { publicKeyPem } = req.body;

    if (!publicKeyPem) {
      return res.status(400).json({ error: "Public key is required" });
    }

    const userId = req.userId;
    const timestamp = Date.now().toString(); // or use new Date().toISOString()

    // ✅ Generate seed from userId + timestamp
    const seed = userId + timestamp;
    const md = forge.md.sha256.create();
    md.update(seed);

    // ✅ Use SHA-256 hash as a 32-byte symmetric AES key
    const symmetricKey = md.digest().getBytes(); // 32 bytes for AES-256

    // ✅ Convert frontend's PEM public key to forge publicKey object
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // ✅ Encrypt symmetric key with RSA public key
    const encryptedSymmetricKey = publicKey.encrypt(symmetricKey, "RSA-OAEP");

    // ✅ Send encrypted key in base64, and also return timestamp so frontend can verify / save if needed
    const encryptedBase64 = forge.util.encode64(encryptedSymmetricKey);

            // Store the symmetric key in memory using userId
        userSymmetricKeys[userId] = {
          key: symmetricKey,
          timestamp
        };


    res.json({
      encryptedSymmetricKey: encryptedBase64,
      seedTimestamp: timestamp // Optional: return timestamp used in generation
    });
  } catch (error) {
    console.error("❌ Error during key exchange:", error);
    res.status(500).json({ error: "Internal server error during key exchange" });
  }
});

// ✅ Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = uuidv4() + ext;
    cb(null, fileName);
  }
});

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
    if (!user) return res.status(404).json({ error: "User not found" });
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
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get chat list with participant names
router.get("/my-chats", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const chats = await Chat.find({ participants: userId })
      .select("participants name isGroup")
      .lean();

    if (!chats.length) return res.status(200).json({ chats: [] });

    const allParticipantIds = [...new Set(chats.flatMap(chat => chat.participants))];

    const users = await User.find({ _id: { $in: allParticipantIds } })
      .select("_id username profileImage")
      .lean();

    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    const chatData = chats.map(chat => {
      const otherParticipantId = chat.participants.find(id => id.toString() !== userId);
      const otherParticipant = userMap[otherParticipantId?.toString()];
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

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    res.json({ chatId: chat._id });
  } catch (error) {
    console.error("Error fetching chat ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-messages", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.query;
    const userId = req.userId;

    const userKeyInfo = userSymmetricKeys[userId];
    if (!userKeyInfo) {
      return res.status(400).json({ error: "Symmetric key not initialized." });
    }

    const symmetricKey = userKeyInfo.key;

    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .populate("sender", "username profileImage")
      .lean();

    const encryptedMessages = messages.map(msg => {
      const iv = crypto.randomBytes(16); // 16 bytes IV for AES-256-CBC
      const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(symmetricKey, 'binary'), iv);
      let encrypted = cipher.update(msg.text, "utf8", "base64");
      encrypted += cipher.final("base64");

      return {
        ...msg,
        text: encrypted, // 👈 Encrypted data replaces `text` directly
        iv: iv.toString("base64") // 🔐 still useful for decryption later
      };
    });

    res.json({ messages: encryptedMessages });

  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Send a new message (with socket.io emit)
// ✅ Send a new message (emit only a signal to refetch)
router.post("/send-message", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("Received message data:", req.body);

    const { chatId, text, type, iv: ivBase64 } = req.body;
    const sender = req.userId;

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    let messageData = {
      chatId,
      sender,
      timestamp: new Date(),
      type,
    };

    if (req.file) {
      // If it's an image message, just store the file
      messageData.text = `/uploads/posts/${req.file.filename}`;
      messageData.type = "picture";
    } else {
      if (!text || !ivBase64) {
        return res.status(400).json({ error: "Encrypted text and IV are required." });
      }

      const userKeyInfo = userSymmetricKeys[sender];
      if (!userKeyInfo) {
        return res.status(400).json({ error: "Symmetric key not initialized for user." });
      }

      const symmetricKey = userKeyInfo.key;
      const iv = Buffer.from(ivBase64, "base64");
      const encryptedText = text;

      // 🔓 Decrypt text before storing
      const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(symmetricKey, "binary"), iv);
      let decrypted = decipher.update(encryptedText, "base64", "utf8");
      decrypted += decipher.final("utf8");

      messageData.text = decrypted;
    }

    const newMessage = await Message.create(messageData);

    // ✅ Emit only a signal to clients in this chat room to refetch messages
    getIO().to(chatId).emit("newMessageSignal", { chatId });

    res.status(201).json({ success: true, newMessage });

  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// ✅ Create a group chat
router.post("/addgroup", authMiddleware, async (req, res) => {
  try {
    const { groupName, participantIds } = req.body;
    const creatorId = req.userId;

    if (!groupName || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ error: "Group name and participants are required" });
    }

    const allParticipants = Array.from(new Set([...participantIds, creatorId]));

    const participantObjectIds = allParticipants.map(id => new mongoose.Types.ObjectId(id));

    const newGroupChat = await Chat.create({
      name: groupName,
      participants: participantObjectIds,
      isGroup: true
    });

    res.status(201).json({
      success: true,
      chat: newGroupChat,
      received: {
        creatorId,
        participantIds,
        groupName
      }
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
