# Withdrawal Error Handling Implementation

## Overview
This document describes the comprehensive withdrawal error handling system that has been implemented to provide tailored, user-specific error messages for different withdrawal scenarios.

## Architecture

### Three-Layer System
1. **Backend Service Layer** (`backend/src/services/withdrawalService.js`)
2. **Backend Controller Integration** (`backend/src/controllers/transactionController.js`)
3. **Frontend Error Utilities & API Wrapper** (3 files)

---

## Backend Implementation

### 1. Withdrawal Service (`backend/src/services/withdrawalService.js`)

**Purpose**: Centralized validation and error message generation for withdrawals

**Key Functions**:

#### `validateWithdrawal(user, account, amount, currency)`
Validates a withdrawal request and returns a tailored error object if validation fails.

**Validation Checks** (in order):
1. **Inheritance Lock**: Checks if user has inheritance lock status
   - Error Code: `INHERITANCE_LOCKED`
   - Status: 403
   - Context: Manager email, 30% unlock fee

2. **Account Status**: Checks if account is frozen or closed
   - Error Codes: `ACCOUNT_FROZEN`, `ACCOUNT_CLOSED`
   - Status: 403
   - Context: Contact support instructions

3. **Withdrawal Enablement**: Checks if withdrawals are disabled on account
   - Error Code: `WITHDRAWALS_DISABLED`
   - Status: 403
   - Context: Contact manager for re-enablement

4. **Daily Withdrawal Limit**: Checks against daily withdrawal limit
   - Error Code: `EXCEEDS_DAILY_LIMIT`
   - Status: 400
   - Context: Max allowed amount, requested amount, excess amount

5. **Account Balance**: Checks sufficient funds
   - Error Code: `INSUFFICIENT_FUNDS`
   - Status: 400
   - Context: Current balance, requested amount, shortfall in currency

6. **Amount Validity**: Checks if amount > 0
   - Error Code: `INVALID_AMOUNT`
   - Status: 400
   - Context: None

**Return Value** (if validation fails):
```javascript
{
  code: "ERROR_CODE",
  status: 400|403,
  message: "User-facing message",
  details: "Technical details for support team",
  action: "contact_support|contact_manager|reduce_amount|increase_balance|check_amount|retry",
  userMessage: "Personalized message with user's first name",
  // Context-specific fields:
  limit?: number,                    // For EXCEEDS_DAILY_LIMIT
  requestedAmount?: number,
  maxAllowedAmount?: number,
  currentBalance?: number,           // For INSUFFICIENT_FUNDS
  shortfall?: number,
}
```

**Return Value** (if validation passes): `null`

### 2. Transaction Controller Integration

The transaction controller uses `validateWithdrawal()` to check withdrawals before processing:

```javascript
// Step 1: Identify if transaction is a withdrawal
const isWithdrawal = 
  (type && type.toLowerCase().includes("withdraw")) ||
  (typeof amount === "number" && amount < 0);

// Step 2: Validate withdrawal if applicable
if (isWithdrawal) {
  const withdrawalError = await validateWithdrawal(user, account, Math.abs(amount), currency);
  
  // Step 3: Return error if validation failed
  if (withdrawalError) {
    return res.status(withdrawalError.status || 403).json({
      message: withdrawalError.message,
      code: withdrawalError.code,
      details: withdrawalError.details,
      action: withdrawalError.action,
      // Context fields spread based on error type
      ...(withdrawalError.limit && { limit: withdrawalError.limit }),
      ...(withdrawalError.currentBalance !== undefined && { currentBalance: withdrawalError.currentBalance }),
      ...(withdrawalError.shortfall && { shortfall: withdrawalError.shortfall }),
    });
  }
}

// Step 4: Process withdrawal if validation passed
account.balance += -Math.abs(amount);
await account.save();

// Step 5: Create notification for user
await notifyFinancialEvent(req.user._id, "transaction", "outgoing", {...});
```

---

## Frontend Implementation

### 1. Withdrawal Error Type (`frontend/src/lib/withdrawalErrors.ts`)

**Exported Interfaces**:

```typescript
interface WithdrawalError {
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
```

**Exported Functions**:

#### `getWithdrawalErrorMessage(error: WithdrawalError): string`
Returns a user-friendly error message based on error code.

Example outputs:
- `INHERITANCE_LOCKED`: "Your account is inheritance-locked. A 30% fee applies to unlock. Contact your account manager..."
- `INSUFFICIENT_FUNDS`: "You only have $150 available, but you're trying to withdraw $200. You're short by $50."
- `EXCEEDS_DAILY_LIMIT`: "Daily withdrawal limit is $1000 (you're trying to withdraw $1500). Reduce your withdrawal amount."

#### `getErrorActionText(error: WithdrawalError): string`
Returns button/action text based on error type.

#### `isRecoverableError(error: WithdrawalError): boolean`
Checks if error can be recovered by user (amount adjustment, deposit, etc.) vs. requires support.

#### `formatErrorToast(error: WithdrawalError): { title, description, variant }`
Formats error for toast notification display.

#### `getSuggestedActions(error: WithdrawalError): string[]`
Returns array of suggested next steps based on error code.

### 2. Enhanced API Error Handling (`frontend/src/lib/api.ts`)

**New Class: `APIError`**

Extends `Error` to preserve error details from backend:

```javascript
class APIError extends Error {
  status: number;
  code?: string;
  details?: string;
  action?: string;
  [key: string]: any;
}
```

**Updated `request()` Function**:
- Catches API errors and wraps them in `APIError` class
- Preserves all error fields from backend response
- Makes error context available to callers

### 3. Withdrawal API Wrapper (`frontend/src/lib/withdrawalApi.ts`)

**Main Function: `createWithdrawal()`**

Handles withdrawal transactions with built-in error parsing:

```typescript
createWithdrawal(
  accountId: string,
  amount: number,
  currency: string,
  description: string,
  category: string
): Promise<{
  success: boolean;
  data?: any;           // Transaction data on success
  error?: WithdrawalError;  // Error details on failure
}>
```

**Behavior**:
1. Creates withdrawal transaction via API
2. Catches `APIError` if withdrawal validation fails
3. Extracts error code, message, details, action, and context fields
4. Returns structured error object for frontend handling

**Usage Example**:
```typescript
const result = await createWithdrawal(accountId, 500, "USD", "ATM Withdrawal", "cash");

if (result.success) {
  toast({ title: "Success", description: "Withdrawal processed" });
  // Update UI with transaction
} else {
  const error = result.error!;
  const message = getWithdrawalErrorMessage(error);
  const actions = getSuggestedActions(error);
  
  toast({
    title: "Withdrawal Failed",
    description: message,
    variant: "destructive"
  });
  
  // Display suggested actions
  actions.forEach(action => console.log(action));
}
```

---

## Usage Examples

### Backend: Direct Validation
```javascript
const { validateWithdrawal } = require("../services/withdrawalService");

const error = await validateWithdrawal(user, account, 500, "USD");
if (error) {
  return res.status(error.status).json(error);
}
```

### Frontend: Handling Withdrawal Request
```typescript
import { createWithdrawal } from "@/lib/withdrawalApi";
import { 
  getWithdrawalErrorMessage,
  getSuggestedActions 
} from "@/lib/withdrawalErrors";
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

async function handleWithdraw() {
  const result = await createWithdrawal(
    selectedAccount._id,
    withdrawAmount,
    "USD",
    "ATM Withdrawal",
    "withdrawals"
  );

  if (!result.success && result.error) {
    const error = result.error;
    const message = getWithdrawalErrorMessage(error);
    const actions = getSuggestedActions(error);

    toast({
      title: "Withdrawal Failed",
      description: message,
      variant: "destructive"
    });

    // Display suggested actions in UI
    setErrorActions(actions);
  } else if (result.success) {
    toast({
      title: "Success",
      description: "Withdrawal processed successfully"
    });
    setTransactions([...transactions, result.data]);
  }
}
```

---

## Error Code Reference

| Code | Status | Severity | Recoverable | Context Fields |
|------|--------|----------|-------------|-----------------|
| `INHERITANCE_LOCKED` | 403 | High | No | manager email |
| `ACCOUNT_FROZEN` | 403 | High | No | none |
| `ACCOUNT_CLOSED` | 403 | High | No | none |
| `WITHDRAWALS_DISABLED` | 403 | Medium | No | none |
| `EXCEEDS_DAILY_LIMIT` | 400 | Medium | Yes | limit, requestedAmount, maxAllowedAmount |
| `INSUFFICIENT_FUNDS` | 400 | Low | Yes | currentBalance, requestedAmount, shortfall |
| `INVALID_AMOUNT` | 400 | Low | Yes | none |
| `UNKNOWN_ERROR` | 500 | High | No | none |

---

## Integration Points

### Where Withdrawals Happen
1. **Transactions Page** (`frontend/src/pages/Transactions.tsx`)
   - Import `withdrawalApi` to create withdrawals
   - Use utility functions to display errors

2. **Transfer Page** (`frontend/src/pages/Transfer.tsx`)
   - Similar integration for transfer withdrawals

3. **Any Custom Withdrawal Component**
   - Use `createWithdrawal()` wrapper for consistency

### Database Models
- **User**: `inheritanceLocked`, `bankManagerEmail` fields
- **Account**: `status`, `limitations.withdrawalsEnabled`, `limitations.withdrawalLimit` fields
- **Notification**: Auto-created on transaction completion

---

## Testing

### Backend Testing
```bash
# Test inheritance lock scenario
const error = await validateWithdrawal(lockedUser, account, 500, "USD");
// Expect: code === "INHERITANCE_LOCKED", status === 403

# Test insufficient funds
const error = await validateWithdrawal(user, lowBalanceAccount, 500, "USD");
// Expect: code === "INSUFFICIENT_FUNDS", shortfall === 150

# Test daily limit exceeded
const error = await validateWithdrawal(user, account, 2000, "USD");
// Expect: code === "EXCEEDS_DAILY_LIMIT", limit === 1000
```

### Frontend Testing
```typescript
// Test error parsing
const result = await createWithdrawal(accountId, 500, "USD", "test", "test");
// Expect: result.success === false
// Expect: result.error.code to be one of valid codes
// Expect: result.error.details to be populated

// Test error display
const error = result.error;
const message = getWithdrawalErrorMessage(error);
// Expect: message to match error code description
```

---

## Future Enhancements

1. **Frontend UI Components**
   - Dedicated error dialog with suggested actions
   - Real-time balance/limit checking before submission
   - Visual feedback for validation states

2. **Backend Enhancements**
   - Withdrawal request queueing for review
   - Fraud detection integration
   - Multi-step verification for large withdrawals

3. **Analytics**
   - Track withdrawal failures by error code
   - Identify common user blockers
   - Suggest feature improvements

4. **Notifications**
   - Email/SMS on withdrawal failure with next steps
   - Account manager alerts for inheritance-locked users
   - Limit increase requests

---

## Files Modified/Created

**Backend**:
- ✅ `src/services/withdrawalService.js` (NEW - 124 lines)
- ✅ `src/controllers/transactionController.js` (MODIFIED - removed inline function, added import)

**Frontend**:
- ✅ `src/lib/api.ts` (MODIFIED - added APIError class)
- ✅ `src/lib/withdrawalErrors.ts` (NEW - 154 lines)
- ✅ `src/lib/withdrawalApi.ts` (NEW - 119 lines)
- ✅ `src/pages/Transactions.tsx` (MODIFIED - added imports, fixed demoAccounts)

**Documentation**:
- ✅ `WITHDRAWAL_ERROR_HANDLING.md` (THIS FILE)
