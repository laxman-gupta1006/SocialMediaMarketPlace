const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachments: [
    {
      type: { type: String, enum: ["image", "file"] },
      url: { type: String },
      name: { type: String }
    }
  ]
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
