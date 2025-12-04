// API client for backend communication

export interface User {
  id: string;
  username: string | null;
  email: string | null;
  name: string;
  phone?: string | null;
  profilePhoto?: string | null;
  verified: boolean;
  onboardingComplete?: boolean;
  authProvider?: "local" | "replit";
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

export async function login(username: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
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

export async function completeOnboarding(): Promise<{ id: string; onboardingComplete: boolean }> {
  const response = await fetch(`${API_BASE}/auth/complete-onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to complete onboarding");
  }
  return response.json();
}

export function redirectToSocialLogin(): void {
  window.location.href = "/api/login";
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

export async function verifyDeposits(): Promise<{
  message: string;
  verified: number;
  reconciled: number;
  checked: number;
}> {
  const response = await fetch(`${API_BASE}/pix/deposits/verify`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify deposits");
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

// ==================== VIRTUAL CARDS ====================

export interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  status: "active" | "frozen" | "cancelled";
  monthlyLimit: string;
  dailyWithdrawalLimit: string;
}

export async function getCard(): Promise<VirtualCard> {
  const response = await fetch(`${API_BASE}/cards`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch card");
  }
  return response.json();
}

export async function getCardDetails(): Promise<VirtualCard> {
  const response = await fetch(`${API_BASE}/cards/details`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch card details");
  }
  return response.json();
}

export async function updateCardStatus(status: "active" | "frozen"): Promise<VirtualCard> {
  const response = await fetch(`${API_BASE}/cards/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update card status");
  }
  return response.json();
}

// ==================== KYC ====================

export interface KycSubmission {
  id: string;
  userId: string;
  status: "not_started" | "pending" | "in_review" | "approved" | "rejected";
  idFrontUploaded: boolean;
  idBackUploaded: boolean;
  selfieUploaded: boolean;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

export async function getKyc(): Promise<KycSubmission> {
  const response = await fetch(`${API_BASE}/kyc`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch KYC status");
  }
  return response.json();
}

export async function updateKyc(step: "id_front" | "id_back" | "selfie"): Promise<KycSubmission> {
  const response = await fetch(`${API_BASE}/kyc`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step }),
  });
  if (!response.ok) {
    throw new Error("Failed to update KYC");
  }
  return response.json();
}

export async function submitKyc(): Promise<KycSubmission> {
  const response = await fetch(`${API_BASE}/kyc/submit`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit KYC");
  }
  return response.json();
}

// ==================== SECURITY SETTINGS ====================

export interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginAlertsEnabled: boolean;
  transactionAlertsEnabled: boolean;
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const response = await fetch(`${API_BASE}/security`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch security settings");
  }
  return response.json();
}

export async function updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
  const response = await fetch(`${API_BASE}/security`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to update security settings");
  }
  return response.json();
}

// ==================== ACTIVE SESSIONS ====================

export interface ActiveSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  location?: string | null;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export async function getSessions(): Promise<ActiveSession[]> {
  const response = await fetch(`${API_BASE}/sessions`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  return response.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to terminate session");
  }
}

export async function logoutAllSessions(exceptCurrent?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/sessions/logout-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exceptCurrent }),
  });
  if (!response.ok) {
    throw new Error("Failed to terminate sessions");
  }
}

// ==================== REFERRALS ====================

export interface ReferralStats {
  invited: number;
  active: number;
  earned: number;
  pending: number;
}

export interface RecentReferral {
  id: string;
  name: string;
  date: string;
  status: "pending" | "active" | "rewarded";
  earned: string | null;
}

export interface ReferralData {
  code: string;
  stats: ReferralStats;
  recentReferrals: RecentReferral[];
}

export async function getReferrals(): Promise<ReferralData> {
  const response = await fetch(`${API_BASE}/referrals`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch referrals");
  }
  return response.json();
}

// ==================== ANALYTICS ====================

export interface TransactionStats {
  income: number;
  expenses: number;
  exchanges: number;
  dailyData: { date: string; income: number; expense: number }[];
}

export async function getStats(days: number = 7): Promise<TransactionStats> {
  const response = await fetch(`${API_BASE}/stats?days=${days}`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}
