// API client for backend communication

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  profilePhoto?: string;
  verified: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: "BRL" | "USDT" | "BTC";
  balance: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "exchange" | "transfer";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  fromCurrency: "BRL" | "USDT" | "BTC" | null;
  toCurrency: "BRL" | "USDT" | "BTC" | null;
  fromAmount: string | null;
  toAmount: string | null;
  description: string;
  externalId: string | null;
  createdAt: string;
}

export interface PixKey {
  id: string;
  userId: string;
  keyType: "cpf" | "cnpj" | "email" | "phone" | "random";
  keyValue: string;
  name: string | null;
  verified: boolean;
  createdAt: string;
}

export interface PixDeposit {
  id: string;
  txid: string;
  amount: string;
  pixCopiaECola: string;
  expiresAt: string;
  status: string;
}

const API_BASE = "/api";

// ==================== AUTH ====================

export async function register(data: {
  username: string;
  email: string;
  password: string;
  name: string;
  cpf?: string;
}): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }
  return response.json();
}

export interface LoginResponse {
  requiresTwoFactor?: boolean;
  userId?: string;
  message?: string;
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  phone?: string;
  profilePhoto?: string;
  verified?: boolean;
}

export async function login(username: string, password: string, twoFactorCode?: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, twoFactorCode }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_BASE}/auth/me`);
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to get user");
  }
  return response.json();
}

export async function updateProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
}): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }
  return response.json();
}

// ==================== WALLETS ====================

export async function getWallets(): Promise<Wallet[]> {
  const response = await fetch(`${API_BASE}/wallets`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch wallets");
  }
  return response.json();
}

// ==================== TRANSACTIONS ====================

export async function getTransactions(limit: number = 20): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE}/transactions?limit=${limit}`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}

// ==================== RATES ====================

export interface ExchangeRates {
  baseRate: number;
  usdtBrl: {
    buy: number;
    sell: number;
  };
  fee: number;
  minUsdt: number;
  minBrl: number;
  updatedAt: string;
}

export async function getRates(): Promise<ExchangeRates> {
  const response = await fetch(`${API_BASE}/rates`);
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates");
  }
  return response.json();
}

// ==================== EXCHANGE ====================

export async function executeExchange(
  fromCurrency: string,
  toCurrency: string,
  amount: string
): Promise<Transaction & { rate: number; fee: string }> {
  const response = await fetch(`${API_BASE}/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromCurrency, toCurrency, amount }),
  });
  
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to execute exchange");
  }
  
  return response.json();
}

// ==================== PIX KEYS ====================

export async function getPixKeys(): Promise<PixKey[]> {
  const response = await fetch(`${API_BASE}/pix-keys`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch PIX keys");
  }
  return response.json();
}

export async function addPixKey(data: {
  keyType: "cpf" | "cnpj" | "email" | "phone" | "random";
  keyValue: string;
  name?: string;
}): Promise<PixKey> {
  const response = await fetch(`${API_BASE}/pix-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add PIX key");
  }
  return response.json();
}

export async function deletePixKey(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/pix-keys/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete PIX key");
  }
}

// ==================== PIX DEPOSITS ====================

export async function createPixDeposit(amount: string): Promise<PixDeposit> {
  const response = await fetch(`${API_BASE}/pix/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create deposit");
  }
  return response.json();
}

export async function getPendingDeposits(): Promise<PixDeposit[]> {
  const response = await fetch(`${API_BASE}/pix/deposits/pending`);
  if (!response.ok) {
    throw new Error("Failed to fetch deposits");
  }
  return response.json();
}

// ==================== PIX WITHDRAWALS ====================

export async function createPixWithdrawal(pixKeyId: string, amount: string): Promise<{
  id: string;
  amount: string;
  status: string;
  endToEndId?: string;
}> {
  const response = await fetch(`${API_BASE}/pix/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pixKeyId, amount }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create withdrawal");
  }
  return response.json();
}

export async function getWithdrawals(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/pix/withdrawals`);
  if (!response.ok) {
    throw new Error("Failed to fetch withdrawals");
  }
  return response.json();
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  userId: string;
  type: "deposit_pending" | "deposit_completed" | "deposit_failed" | "withdrawal_pending" | "withdrawal_completed" | "withdrawal_failed" | "exchange_completed" | "exchange_failed" | "security_alert" | "system";
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(limit: number = 50): Promise<Notification[]> {
  const response = await fetch(`${API_BASE}/notifications?limit=${limit}`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE}/notifications/unread-count`);
  if (response.status === 401) {
    return { count: 0 };
  }
  if (!response.ok) {
    throw new Error("Failed to get unread count");
  }
  return response.json();
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
  return response.json();
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
}

// ==================== WEBSOCKET ====================

export async function getWebSocketToken(): Promise<{ token: string }> {
  const response = await fetch(`${API_BASE}/auth/ws-token`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to get WebSocket token");
  }
  return response.json();
}

// ==================== KYC ====================

export interface KycStatus {
  kycLevel: "none" | "basic" | "full";
  kycVerifiedAt: string | null;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  isUnlimited: boolean;
}

export async function getKycStatus(): Promise<KycStatus> {
  const response = await fetch(`${API_BASE}/kyc/status`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to get KYC status");
  }
  return response.json();
}

// ==================== SECURITY ====================

export interface TwoFactorSetup {
  secret: string;
  otpAuthUrl: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  hasSecret: boolean;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to change password");
  }
  return response.json();
}

export async function get2FAStatus(): Promise<TwoFactorStatus> {
  const response = await fetch(`${API_BASE}/auth/2fa/status`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to get 2FA status");
  }
  return response.json();
}

export async function setup2FA(): Promise<TwoFactorSetup> {
  const response = await fetch(`${API_BASE}/auth/2fa/setup`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to setup 2FA");
  }
  return response.json();
}

export async function verify2FA(code: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/2fa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Invalid verification code");
  }
  return response.json();
}

export async function disable2FA(password: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/2fa/disable`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to disable 2FA");
  }
  return response.json();
}
