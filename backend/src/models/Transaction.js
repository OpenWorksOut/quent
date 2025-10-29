const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer", "payment"],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["income", "expense", "transfer"],
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
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    frequency: {
      type: String,
      enum: ["one-time", "weekly", "monthly", "quarterly", "yearly"],
      default: "one-time",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    merchantName: String,
    merchantLogo: String,
    reference: {
      type: String,
      unique: true,
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
    metadata: {
      type: Map,
      of: String,
    },
    analytics: {
      monthlyBudgetCategory: { type: String },
      budgetPeriod: { type: String },
      budgetAllocation: { type: Number },
      varianceFromBudget: { type: Number },
      trend: {
        type: String,
        enum: ["increasing", "decreasing", "stable"],
      },
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

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
