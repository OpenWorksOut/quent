/**
 * Withdrawal Validation Service
 * Provides tailored error messages for different withdrawal scenarios
 */

/**
 * Validate withdrawal and return tailored error message if applicable
 * @param {object} user - The user object
 * @param {object} account - The account object
 * @param {number} amount - Withdrawal amount
 * @param {string} currency - Currency code
 * @returns {object|null} Error object with tailored message or null if valid
 */
async function validateWithdrawal(user, account, amount, currency) {
  // Check inheritance lock
  if (user.inheritanceLocked) {
    return {
      code: "INHERITANCE_LOCKED",
      status: 403,
      message: `Your account is temporarily locked due to inheritance verification. To proceed with this withdrawal of ${amount} ${currency}, you must resolve this with your account manager.`,
      details: `Contact your account manager at ${user.bankManagerEmail} for immediate assistance. A 30% fee applies to unlock.`,
      action: "contact_support",
      userMessage: `Hi ${user.firstName}, your account needs inheritance verification before you can withdraw. Please reach out to ${user.bankManagerEmail}.`,
    };
  }

  // Check account status
  if (account.status === "frozen") {
    return {
      code: "ACCOUNT_FROZEN",
      status: 403,
      message: `Your ${account.name} account has been frozen and cannot process withdrawals at this time.`,
      details: "This may be due to suspicious activity or security concerns. Please contact support to resolve.",
      action: "contact_support",
      userMessage: `Your ${account.name} account is currently frozen. Please contact support for assistance.`,
    };
  }

  if (account.status === "closed") {
    return {
      code: "ACCOUNT_CLOSED",
      status: 403,
      message: `Your ${account.name} account is closed and cannot process transactions.`,
      details: "If you believe this is an error, please contact our support team.",
      action: "contact_support",
      userMessage: `Your ${account.name} account is closed. Please contact support if you believe this is an error.`,
    };
  }

  // Check if withdrawals are disabled
  if (account.limitations && account.limitations.withdrawalsEnabled === false) {
    return {
      code: "WITHDRAWALS_DISABLED",
      status: 403,
      message: `Withdrawals are currently disabled on your ${account.name} account.`,
      details: "Contact your account manager to re-enable withdrawal capabilities.",
      action: "contact_manager",
      userMessage: `Withdrawals are disabled on your ${account.name}. Contact your account manager to enable them.`,
    };
  }

  // Check daily withdrawal limit
  if (account.limitations && account.limitations.withdrawalLimit) {
    if (amount > account.limitations.withdrawalLimit) {
      const maxAllowed = account.limitations.withdrawalLimit;
      const excess = (amount - maxAllowed).toFixed(2);
      return {
        code: "EXCEEDS_DAILY_LIMIT",
        status: 400,
        message: `This withdrawal exceeds your daily limit of ${maxAllowed} ${currency}.`,
        details: `You're attempting to withdraw ${amount} ${currency}, which is ${excess} ${currency} over your limit. Try withdrawing ${maxAllowed} ${currency} or less.`,
        action: "reduce_amount",
        userMessage: `Daily withdrawal limit is ${maxAllowed} ${currency}. You can withdraw up to this amount today.`,
        limit: maxAllowed,
        requestedAmount: amount,
        maxAllowedAmount: maxAllowed,
      };
    }
  }

  // Check account balance
  if (account.balance < amount) {
    const shortfall = (amount - account.balance).toFixed(2);
    return {
      code: "INSUFFICIENT_FUNDS",
      status: 400,
      message: `Insufficient funds in your ${account.name} account.`,
      details: `Your current balance is ${account.balance} ${currency}, but you're attempting to withdraw ${amount} ${currency}. You're short by ${shortfall} ${currency}.`,
      action: "increase_balance",
      userMessage: `Your ${account.name} balance (${account.balance} ${currency}) is not enough for a ${amount} ${currency} withdrawal. You need ${shortfall} ${currency} more.`,
      currentBalance: account.balance,
      requestedAmount: amount,
      shortfall: shortfall,
    };
  }

  // Check if amount is valid
  if (amount <= 0) {
    return {
      code: "INVALID_AMOUNT",
      status: 400,
      message: `Withdrawal amount must be greater than 0 ${currency}.`,
      details: "Please enter a valid positive amount to withdraw.",
      action: "check_amount",
      userMessage: "Withdrawal amount must be greater than 0.",
    };
  }

  // All checks passed
  return null;
}

/**
 * Get user-friendly withdrawal error message
 * @param {object} error - Error object from validateWithdrawal
 * @param {object} user - User object for personalization
 * @returns {string} User-friendly error message
 */
function getUserFriendlyMessage(error, user) {
  if (!error || !error.userMessage) {
    return "Unable to process withdrawal. Please try again or contact support.";
  }

  return error.userMessage;
}

module.exports = {
  validateWithdrawal,
  getUserFriendlyMessage,
};
