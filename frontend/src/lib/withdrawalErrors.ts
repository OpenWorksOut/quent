/**
 * Withdrawal Error Handler Utility
 * Parses and formats withdrawal error messages for frontend display
 */

export interface WithdrawalError {
  code: string;
  message: string;
  details: string;
  action: string;
  limit?: number;
  requestedAmount?: number;
  currentBalance?: number;
  shortfall?: number;
  maxAllowedAmount?: number;
}

/**
 * Get a user-friendly error message with context
 */
export function getWithdrawalErrorMessage(error: WithdrawalError): string {
  switch (error.code) {
    case "INHERITANCE_LOCKED":
      return `Your account is inheritance-locked. A 30% fee applies to unlock. Contact your account manager: ${error.details}`;

    case "ACCOUNT_FROZEN":
      return "Your account has been frozen. Please contact support to resolve this issue.";

    case "ACCOUNT_CLOSED":
      return "Your account is closed and cannot process withdrawals.";

    case "WITHDRAWALS_DISABLED":
      return "Withdrawals are currently disabled on this account. Contact your account manager to enable them.";

    case "EXCEEDS_DAILY_LIMIT":
      return `Daily withdrawal limit is ${error.limit} ${
        error.requestedAmount ? ` (you're trying to withdraw ${error.requestedAmount})` : ""
      }. Reduce your withdrawal amount.`;

    case "INSUFFICIENT_FUNDS":
      return `You only have ${error.currentBalance} available, but you're trying to withdraw ${error.requestedAmount}. You're short by ${error.shortfall}.`;

    case "INVALID_AMOUNT":
      return "Withdrawal amount must be greater than 0.";

    default:
      return error.message || "Unable to process withdrawal. Please try again.";
  }
}

/**
 * Get action button text based on error code
 */
export function getErrorActionText(error: WithdrawalError): string {
  switch (error.code) {
    case "INHERITANCE_LOCKED":
      return "Contact Manager";

    case "ACCOUNT_FROZEN":
    case "ACCOUNT_CLOSED":
    case "WITHDRAWALS_DISABLED":
      return "Contact Support";

    case "EXCEEDS_DAILY_LIMIT":
      return "Adjust Amount";

    case "INSUFFICIENT_FUNDS":
      return "Insufficient Funds";

    default:
      return "Try Again";
  }
}

/**
 * Check if error is recoverable by user action
 */
export function isRecoverableError(error: WithdrawalError): boolean {
  const recoverableCodes = [
    "EXCEEDS_DAILY_LIMIT",
    "INSUFFICIENT_FUNDS",
    "INVALID_AMOUNT",
  ];
  return recoverableCodes.includes(error.code);
}

/**
 * Format withdrawal error for toast notification
 */
export function formatErrorToast(error: WithdrawalError): {
  title: string;
  description: string;
  variant: "default" | "destructive";
} {
  return {
    title: "Withdrawal Failed",
    description: getWithdrawalErrorMessage(error),
    variant: "destructive",
  };
}

/**
 * Get suggested next steps based on error
 */
export function getSuggestedActions(error: WithdrawalError): string[] {
  const actions: string[] = [];

  switch (error.code) {
    case "INHERITANCE_LOCKED":
      actions.push("Contact your account manager");
      actions.push("Pay 30% fee to unlock");
      break;

    case "ACCOUNT_FROZEN":
      actions.push("Contact support");
      actions.push("Verify your identity if requested");
      break;

    case "ACCOUNT_CLOSED":
      actions.push("Contact support to reopen");
      break;

    case "WITHDRAWALS_DISABLED":
      actions.push("Request withdrawal permission from account manager");
      break;

    case "EXCEEDS_DAILY_LIMIT":
      actions.push(`Withdraw ${error.maxAllowedAmount || error.limit} or less today`);
      actions.push("Try again tomorrow for additional withdrawals");
      break;

    case "INSUFFICIENT_FUNDS":
      actions.push(`Deposit ${error.shortfall} to complete this withdrawal`);
      actions.push("Reduce withdrawal amount");
      break;

    case "INVALID_AMOUNT":
      actions.push("Enter an amount greater than 0");
      break;

    default:
      actions.push("Check your account details");
  }

  return actions;
}
