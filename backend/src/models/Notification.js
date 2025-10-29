const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["transaction", "security", "system", "card", "savings"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    icon: String,
    metadata: {
      type: Map,
      of: String,
    },
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
