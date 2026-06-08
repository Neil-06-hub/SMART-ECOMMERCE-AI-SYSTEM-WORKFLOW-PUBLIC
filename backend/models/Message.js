const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["customer", "admin", "bot"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
