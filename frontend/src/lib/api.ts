const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

type RequestOptions = {
  method?: string;
  body?: any;
  token?: string | null;
};

export async function request(path: string, opts: RequestOptions = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = opts.token ?? localStorage.getItem("auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: any = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message || `Request failed ${res.status}`);
  }
  return data;
}

export async function register(payload: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
}) {
  return request("/auth/register", { method: "POST", body: payload });
}

export async function verifyOtp(payload: { email: string; code: string }) {
  return request("/auth/verify-otp", { method: "POST", body: payload });
}

export async function verifyLoginOtp(payload: { email: string; code: string }) {
  return request("/auth/verify-login-otp", { method: "POST", body: payload });
}

export async function resendOtp(payload: { email: string }) {
  return request("/auth/resend-otp", { method: "POST", body: payload });
}

export async function login(payload: { email: string; password: string }) {
  return request("/auth/login", { method: "POST", body: payload });
}

export async function me() {
  return request("/auth/me");
}

export async function getFinancialProfile() {
  return request("/finance/profile");
}

export async function updateFinancialProfile(data: {
  monthlyIncome?: { amount: number; currency: string };
  monthlyBudget?: { amount: number; currency: string };
  savingsGoal?: { monthlyTarget: number; currency: string };
  preferences?: {
    defaultCurrency: string;
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}) {
  return request("/finance/profile", { method: "PATCH", body: data });
}

export async function getMonthlyStatistics() {
  return request("/finance/statistics/monthly");
}

export async function getAccounts() {
  return request("/accounts/me");
}

export async function getTransactionsForUser() {
  return request("/transactions/user");
}

export async function createAccount(body: any) {
  return request("/accounts", { method: "POST", body });
}

export async function updateAccount(id: string, body: any) {
  return request(`/accounts/${id}`, { method: "PUT", body });
}

export async function setAccountWithdrawals(
  id: string,
  enabled: boolean,
  withdrawalLimit?: number
) {
  const body: any = { enabled };
  if (withdrawalLimit !== undefined) body.withdrawalLimit = withdrawalLimit;
  return request(`/accounts/${id}/withdrawals`, { method: "PATCH", body });
}

export async function createTransaction(body: any) {
  return request("/transactions", { method: "POST", body });
}

export async function getCards() {
  return request("/cards");
}

export async function getCard(id: string) {
  return request(`/cards/${id}`);
}

export async function requestCard(body: any) {
  return request("/cards", { method: "POST", body });
}

export async function getSavings() {
  return request("/savings");
}

export async function createSavings(body: any) {
  return request("/savings", { method: "POST", body });
}

export async function depositSavings(id: string, body: any) {
  return request(`/savings/${id}/deposit`, { method: "POST", body });
}

export async function createTransfer(body: any) {
  return request("/transfers", { method: "POST", body });
}

export async function getNotifications() {
  return request("/notifications");
}

export async function markNotificationRead(id: string) {
  return request(`/notifications/${id}/read`, { method: "POST" });
}

export async function getPaymentMethods() {
  return request("/payment-methods");
}

export async function createPaymentMethod(body: any) {
  return request("/payment-methods", { method: "POST", body });
}

export async function deletePaymentMethod(id: string) {
  return request(`/payment-methods/${id}`, { method: "DELETE" });
}

const apiDefault = {
  request,
  register,
  login,
  verifyOtp,
  verifyLoginOtp,
  resendOtp,
  me,
  getFinancialProfile,
  updateFinancialProfile,
  getMonthlyStatistics,
  getAccounts,
  getTransactionsForUser,
  createAccount,
  updateAccount,
  setAccountWithdrawals,
  createTransaction,
  getCards,
  getCard,
  requestCard,
  getSavings,
  createSavings,
  depositSavings,
  createTransfer,
  getNotifications,
  markNotificationRead,
  getPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
};

export default apiDefault;
