const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountType: {
      type: String,
      enum: ["individual", "joint", "checking", "savings"],
      required: true,
      default: "individual"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "frozen", "closed"],
      default: "active",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    // Primary owner is required
    primaryOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Secondary owners for joint accounts
    secondaryOwners: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permissions: {
          type: String,
          enum: ["full", "view", "transact"],
          default: "full",
        },
        status: {
          type: String,
          enum: ["pending", "active", "removed"],
          default: "pending",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    name: {
      type: String,
      required: true,
    },
    description: String,
    limitations: {
      dailyTransferLimit: {
        type: Number,
        default: 10000,
      },
      dailyWithdrawalLimit: {
        type: Number,
        default: 5000,
      },
      // Allow disabling withdrawals for the account
      withdrawalsEnabled: {
        type: Boolean,
        default: true,
      },
      withdrawalLimit: {
        type: Number,
        default: 5000,
      },
    },
    notifications: {
      lowBalanceAlert: {
        enabled: {
          type: Boolean,
          default: true,
        },
        threshold: {
          type: Number,
          default: 100,
        },
      },
      largeTransactionAlert: {
        enabled: {
          type: Boolean,
          default: true,
        },
        threshold: {
          type: Number,
          default: 1000,
        },
      },
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
    lastTransactionAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ primaryOwner: 1 });
accountSchema.index({ "secondaryOwners.user": 1 });

// Validate joint account has at least one secondary owner
accountSchema.pre("save", function (next) {
  console.log("Account pre-save validation - accountType:", this.accountType, "secondaryOwners:", this.secondaryOwners);
  
  // Only validate secondary owners for explicitly joint accounts
  // Note: "checking" and "savings" are account product types, not ownership types
  if (this.accountType === "joint") {
    if (!this.secondaryOwners || this.secondaryOwners.length === 0) {
      console.log("Joint account validation failed - no secondary owners");
      return next(new Error("Joint accounts must have at least one secondary owner"));
    }
  }
  
  // Skip validation for checking, savings, and individual accounts
  if (["checking", "savings", "individual"].includes(this.accountType)) {
    console.log("Skipping joint validation for account type:", this.accountType);
  }
  
  console.log("Account validation passed for accountType:", this.accountType);
  next();
});

// Method to check if a user has access to this account
accountSchema.methods.hasAccess = function (userId) {
  if (this.primaryOwner.toString() === userId.toString()) return true;
  return this.secondaryOwners.some(
    (owner) =>
      owner.user.toString() === userId.toString() && owner.status === "active"
  );
};

// Method to check specific permission level for a user
accountSchema.methods.checkPermission = function (userId, requiredPermission) {
  if (this.primaryOwner.toString() === userId.toString()) return true;

  const secondaryOwner = this.secondaryOwners.find(
    (owner) =>
      owner.user.toString() === userId.toString() && owner.status === "active"
  );

  if (!secondaryOwner) return false;

  switch (requiredPermission) {
    case "view":
      return true; // All active secondary owners can view
    case "transact":
      return ["full", "transact"].includes(secondaryOwner.permissions);
    case "full":
      return secondaryOwner.permissions === "full";
    default:
      return false;
  }
};

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
