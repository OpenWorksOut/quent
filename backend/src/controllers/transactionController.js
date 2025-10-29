const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

exports.create = async (req, res) => {
  try {
    const { accountId, amount, type, currency, description, category } =
      req.body;
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (!account.hasAccess(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    const tx = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      currency,
      description,
      category,
      metadata: { account: accountId },
    });

    // naive balance update
    // If this is a withdrawal (explicit type or negative amount) ensure withdrawals are enabled
    const isWithdrawal =
      (type && type.toLowerCase().includes("withdraw")) ||
      (typeof amount === "number" && amount < 0);
    if (
      isWithdrawal &&
      account.limitations &&
      account.limitations.withdrawalsEnabled === false
    ) {
      return res
        .status(403)
        .json({ message: "Withdrawals are disabled on this account" });
    }

    account.balance += amount;
    await account.save();

    res.status(201).json(tx);
  } catch (err) {
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
