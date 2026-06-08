const mongoose = require("mongoose");

const supportRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["bot", "waiting", "active", "closed"], 
      default: "bot" 
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    adminName: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportRoom", supportRoomSchema);
