const Notification = require("../models/Notification");

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to create notification for
 * @param {object} data - Notification data
 * @param {string} data.type - Type: transaction, security, system, card, savings
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} [data.priority] - Priority: low, medium, high (default: low)
 * @param {boolean} [data.actionRequired] - Whether action is required (default: false)
 * @param {string} [data.actionUrl] - URL for action
 * @param {object} [data.metadata] - Additional metadata
 */
async function createNotification(userId, data) {
  try {
    const notification = await Notification.create({
      user: userId,
      type: data.type || "system",
      title: data.title,
      message: data.message,
      priority: data.priority || "low",
      actionRequired: data.actionRequired || false,
      actionUrl: data.actionUrl,
      icon: data.icon,
      metadata: data.metadata,
      status: "unread",
    });
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err);
    // Don't throw - notifications are nice-to-have, not critical
    return null;
  }
}

/**
 * Create notifications for transaction/transfer
 * @param {string} userId - User who initiated the transaction
 * @param {string} type - 'transaction' or 'transfer'
 * @param {string} direction - 'incoming' or 'outgoing'
 * @param {object} details - Transaction/transfer details
 */
async function notifyFinancialEvent(userId, type, direction, details) {
  try {
    const isOutgoing = direction === "outgoing";
    const title =
      type === "transfer"
        ? isOutgoing
          ? "Transfer Sent"
          : "Transfer Received"
        : isOutgoing
        ? "Payment Made"
        : "Payment Received";

    const message =
      type === "transfer"
        ? isOutgoing
          ? `You sent ${details.amount} ${details.currency}`
          : `You received ${details.amount} ${details.currency}`
        : `${details.description || "Transaction"} for ${details.amount} ${details.currency}`;

    await createNotification(userId, {
      type: "transaction",
      title,
      message,
      priority: Math.abs(details.amount) > 1000 ? "high" : "medium",
      metadata: {
        transactionId: details.id,
        amount: details.amount?.toString(),
        currency: details.currency,
      },
    });
  } catch (err) {
    console.error("Failed to create financial event notification:", err);
  }
}

/**
 * Create notification for account event
 * @param {string} userId - Account owner
 * @param {string} event - 'created', 'locked', 'co-owner-added'
 * @param {object} details - Event details
 */
async function notifyAccountEvent(userId, event, details) {
  try {
    let title, message, priority;

    switch (event) {
      case "created":
        title = "Account Created";
        message = `Your new ${details.accountType} account "${details.accountName}" has been created`;
        priority = "low";
        break;
      case "locked":
        title = "Account Locked";
        message = `Your account has been locked due to ${details.reason}`;
        priority = "high";
        break;
      case "co-owner-added":
        title = "Co-owner Added";
        message = `${details.coOwnerName} was added as a co-owner to ${details.accountName}`;
        priority = "medium";
        break;
      case "co-owner-removed":
        title = "Co-owner Removed";
        message = `${details.coOwnerName} was removed from ${details.accountName}`;
        priority = "medium";
        break;
      default:
        return;
    }

    await createNotification(userId, {
      type: event === "locked" ? "security" : "system",
      title,
      message,
      priority,
      metadata: {
        event,
        accountId: details.accountId,
      },
    });
  } catch (err) {
    console.error("Failed to create account event notification:", err);
  }
}

module.exports = {
  createNotification,
  notifyFinancialEvent,
  notifyAccountEvent,
};
