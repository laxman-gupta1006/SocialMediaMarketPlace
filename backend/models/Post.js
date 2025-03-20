const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  profileImage: { type: String },
  image: { type: String, required: true },
  likes: { type: Number, default: 0 },
  caption: { type: String },
  comments: [
    {
      user: { type: String },
      text: { type: String }
    }
  ],
  visibility: { type: String, enum: ["public", "private"], default: "public" }, // New field
  authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who can view private posts
  timestamp: { type: Date, default: Date.now }
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
