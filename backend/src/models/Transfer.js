const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "instant",
    },
    scheduleDate: {
      type: Date,
    },
    description: String,
    reference: {
      type: String,
      unique: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
    fees: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Validate that sender and recipient are different
transferSchema.pre("save", function (next) {
  if (this.sender.toString() === this.recipient.toString()) {
    next(new Error("Sender and recipient cannot be the same"));
  }
  next();
});

const Transfer = mongoose.model("Transfer", transferSchema);

module.exports = Transfer;
