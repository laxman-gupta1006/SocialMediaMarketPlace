require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Post = require("./models/Post");
const Chat = require("./models/Chat");
const Message = require("./models/Message");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log("Connected to MongoDB...");

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});

    console.log("Database cleared...");

    // Create Users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const user1 = await User.create({
      username: "john_doe",
      fullName: "John Doe",
      bio: "Travel enthusiast 🌍 | Photography lover 📸",
      profileImage: "https://example.com/profile.jpg",
      postsCount: 45,
      followers: 2345,
      following: 123,
      email: "john@example.com",
      password: hashedPassword
    });

    const user2 = await User.create({
      username: "alice_smith",
      fullName: "Alice Smith",
      bio: "Graphic Designer ✨",
      profileImage: "https://example.com/alice.jpg",
      email: "alice@example.com",
      password: hashedPassword
    });

    console.log("Users created...");

    // Create Posts
    await Post.create([
      {
        userId: user1._id,
        username: user1.username,
        profileImage: user1.profileImage,
        image: "https://images.unsplash.com/photo-1739036462754-6e86520998a2?q=80&w=2075&auto=format&fit=crop",
        likes: 123,
        caption: "Beautiful sunset 🌅",
        comments: [{ user: "jane_smith", text: "Amazing!" }],
        visibility: "public" // Public post
      },
      {
        userId: user1._id,
        username: user1.username,
        profileImage: user1.profileImage,
        image: "https://images.unsplash.com/photo-1739036462754-6e86520998a2?q=80&w=2075&auto=format&fit=crop",
        likes: 45,
        caption: "My private thoughts 🤫",
        comments: [],
        visibility: "private",
        authorizedUsers: [user2._id] // Only Alice can see this post
      }
    ]);
    console.log("Posts created...");

    // Create Chats (One-to-One and Group)
    const chat1 = await Chat.create({
      isGroup: false,
      name: "Alice & John",
      participants: [user1._id, user2._id]
    });

    const groupChat = await Chat.create({
      isGroup: true,
      name: "Design Team",
      participants: [user1._id, user2._id]
    });

    console.log("Chats created...");

    // Create Messages
    await Message.create([
      {
        chatId: chat1._id,
        sender: user1._id,
        text: "Hey Alice! How are you?",
        attachments: [],
      },
      {
        chatId: groupChat._id,
        sender: user2._id,
        text: "Here are the latest mockups",
        attachments: [
          { type: "image", url: "/images/mockup1.jpg" },
          { type: "file", name: "specs.pdf" }
        ]
      }
    ]);

    console.log("Messages created...");

    console.log("Seeding completed!");
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

seedData();
