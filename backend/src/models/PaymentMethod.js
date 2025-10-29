const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bank_account", "card", "wallet"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Bank account specific fields
    bankDetails: {
      accountNumber: String,
      routingNumber: String,
      bankName: String,
      accountType: {
        type: String,
        enum: ["checking", "savings"],
      },
    },
    // Card specific fields
    cardDetails: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
    },
    // Wallet specific fields
    walletDetails: {
      provider: String,
      email: String,
    },
    metadata: {
      type: Map,
      of: String,
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

// Ensure required fields based on type
paymentMethodSchema.pre("save", function (next) {
  if (this.type === "bank_account" && !this.bankDetails) {
    next(new Error("Bank details are required for bank account type"));
  }
  if (this.type === "card" && !this.cardDetails) {
    next(new Error("Card details are required for card type"));
  }
  if (this.type === "wallet" && !this.walletDetails) {
    next(new Error("Wallet details are required for wallet type"));
  }
  next();
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = PaymentMethod;
