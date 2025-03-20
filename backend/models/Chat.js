const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String }, // Group name (null for one-on-one)
  avatar: { type: String }, // Group or user avatar
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
