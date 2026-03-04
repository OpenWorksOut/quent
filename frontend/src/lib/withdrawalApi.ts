/**
 * Withdrawal API Wrapper
 * Handles withdrawal API calls with built-in error parsing and user feedback
 */

import api from "./api";
import { APIError } from "./api";
import type { WithdrawalError } from "./withdrawalErrors";

/**
 * Create a withdrawal transaction with error handling
 * @param accountId - Account to withdraw from
 * @param amount - Amount to withdraw
 * @param currency - Currency code
 * @param description - Transaction description
 * @param category - Transaction category
 * @returns Promise with transaction or structured error
 */
export async function createWithdrawal(
  accountId: string,
  amount: number,
  currency: string,
  description: string,
  category: string
): Promise<{
  success: boolean;
  data?: any;
  error?: WithdrawalError;
}> {
  try {
    const tx = await api.createTransaction({
      accountId,
      amount: -Math.abs(amount), // Negative for withdrawal
      type: "withdrawal",
      transactionType: "withdrawal",
      currency,
      description,
      category,
    });

    return {
      success: true,
      data: tx,
    };
  } catch (err: any) {
    // Check if it's an APIError with withdrawal-specific details
    if (err instanceof APIError && err.code) {
      const withdrawalError: WithdrawalError = {
        code: err.code,
        message: err.message,
        details: err.details || "",
        action: err.action || "contact_support",
      };

      // Copy any additional context fields
      const contextFields = [
        "limit",
        "requestedAmount",
        "currentBalance",
        "shortfall",
        "maxAllowedAmount",
      ];
      contextFields.forEach((field) => {
        if (field in err) {
          (withdrawalError as any)[field] = (err as any)[field];
        }
      });

      return {
        success: false,
        error: withdrawalError,
      };
    }

    // Generic error
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: err.message || "Failed to process withdrawal",
        details: "An unexpected error occurred. Please try again.",
        action: "retry",
      } as WithdrawalError,
    };
  }
}

/**
 * Get raw response with error details for debugging
 */
export async function getRawWithdrawalResponse(
  accountId: string,
  amount: number,
  currency: string,
  description: string,
  category: string
): Promise<any> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          accountId,
          amount: -Math.abs(amount),
          type: "withdrawal",
          transactionType: "withdrawal",
          currency,
          description,
          category,
        }),
      }
    );

    const data = await response.json();
    return {
      status: response.status,
      success: response.ok,
      data,
    };
  } catch (err: any) {
    return {
      status: 0,
      success: false,
      error: err.message,
    };
  }
}

export default {
  createWithdrawal,
  getRawWithdrawalResponse,
};
