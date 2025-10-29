const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardType: {
      type: String,
      enum: ["virtual", "physical"],
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
      unique: true,
    },
    maskedNumber: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: Number,
      required: true,
    },
    expiryYear: {
      type: Number,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
      select: false, // CVV will not be included in queries by default
    },
    cardholderName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "expired"],
      default: "active",
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    spendingLimit: {
      daily: {
        type: Number,
        default: 1000,
      },
      monthly: {
        type: Number,
        default: 10000,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
