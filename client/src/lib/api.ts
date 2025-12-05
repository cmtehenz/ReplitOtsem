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
  referralCode?: string;
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

// ==================== REFERRAL ====================

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
}

export async function getReferralCode(): Promise<{ code: string }> {
  const response = await fetch(`${API_BASE}/referral/code`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to get referral code");
  }
  return response.json();
}

export async function getReferralStats(): Promise<ReferralStats> {
  const response = await fetch(`${API_BASE}/referral/stats`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to get referral stats");
  }
  return response.json();
}

export async function validateReferralCode(code: string): Promise<{ valid: boolean }> {
  const response = await fetch(`${API_BASE}/referral/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    throw new Error("Failed to validate referral code");
  }
  return response.json();
}

// ==================== SESSION MANAGEMENT ====================

export async function logoutAllSessions(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/logout-all`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to logout all sessions");
  }
  return response.json();
}

export interface LoginSession {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  location: string | null;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export async function getLoginHistory(): Promise<LoginSession[]> {
  const response = await fetch(`${API_BASE}/auth/login-history`);
  if (response.status === 401) {
    throw new Error("Authentication required");
  }
  if (!response.ok) {
    throw new Error("Failed to get login history");
  }
  return response.json();
}

// ==================== KYC SUBMISSION ====================

export async function submitKycDocument(documentType: string, documentData: string): Promise<{ id: string; status: string }> {
  const response = await fetch(`${API_BASE}/kyc/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentType, documentData }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit KYC document");
  }
  return response.json();
}

export async function completeKycVerification(): Promise<{ success: boolean; kycLevel: string }> {
  const response = await fetch(`${API_BASE}/kyc/complete`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to complete KYC verification");
  }
  return response.json();
}

// ==================== CRYPTO NEWS ====================

export interface CryptoNews {
  id: string;
  title: string;
  description: string;
  category: "breaking" | "market" | "general";
  timestamp: string;
  trend: number;
  source: string;
  url?: string;
}

export async function getCryptoNews(language: string = "en"): Promise<CryptoNews[]> {
  const response = await fetch(`${API_BASE}/news?lang=${language}`);
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}

// ==================== STATS ====================

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  weeklyData: { day: string; income: number; expense: number }[];
  categoryBreakdown: { category: string; amount: number; percent: number }[];
}

export async function getTransactionStats(): Promise<TransactionStats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}

// ==================== CRYPTO ADDRESSES ====================

export interface CryptoAddress {
  id: string;
  userId: string;
  currency: string;
  network: string;
  address: string;
  memo?: string;
  isActive: boolean;
  createdAt: string;
}

export async function getCryptoAddresses(): Promise<CryptoAddress[]> {
  const response = await fetch(`${API_BASE}/crypto/addresses`);
  if (!response.ok) {
    throw new Error("Failed to fetch addresses");
  }
  return response.json();
}

export async function getOrCreateCryptoAddress(currency: string, network: string): Promise<CryptoAddress> {
  const response = await fetch(`${API_BASE}/crypto/address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currency, network }),
  });
  if (!response.ok) {
    throw new Error("Failed to get/create address");
  }
  return response.json();
}

// ==================== REFERRAL REWARDS ====================

export interface ReferralReward {
  id: string;
  userId: string;
  referralId: string;
  amount: string;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface ReferralRewardsResponse {
  rewards: ReferralReward[];
  total: number;
  pending: number;
  paid: number;
}

export async function getReferralRewards(): Promise<ReferralRewardsResponse> {
  const response = await fetch(`${API_BASE}/referral/rewards`);
  if (!response.ok) {
    throw new Error("Failed to fetch rewards");
  }
  return response.json();
}

export async function claimReferralRewards(): Promise<{ success: boolean; amount: number; message: string }> {
  const response = await fetch(`${API_BASE}/referral/rewards/claim`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to claim rewards");
  }
  return response.json();
}

// ==================== EMAIL VERIFICATION ====================

export async function requestEmailVerification(): Promise<{ message: string; token?: string }> {
  const response = await fetch(`${API_BASE}/auth/verify-email/request`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to request verification");
  }
  return response.json();
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify email");
  }
  return response.json();
}

// ==================== PASSWORD RESET ====================

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to request reset");
  }
  return response.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }
  return response.json();
}

// ==================== WEBAUTHN / BIOMETRIC LOGIN ====================

export interface WebAuthnCredential {
  id: string;
  deviceName: string;
  deviceType: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export async function getWebAuthnRegistrationOptions(): Promise<any> {
  const response = await fetch(`${API_BASE}/webauthn/register/options`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get registration options");
  }
  return response.json();
}

export async function verifyWebAuthnRegistration(credential: any, deviceName?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/webauthn/register/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, deviceName }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify registration");
  }
  return response.json();
}

export async function getWebAuthnLoginOptions(email?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/webauthn/login/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get login options");
  }
  return response.json();
}

export async function verifyWebAuthnLogin(credential: any, email?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/webauthn/login/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify login");
  }
  return response.json();
}

export async function getWebAuthnCredentials(): Promise<WebAuthnCredential[]> {
  const response = await fetch(`${API_BASE}/webauthn/credentials`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get credentials");
  }
  return response.json();
}

export async function deleteWebAuthnCredential(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/webauthn/credentials/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete credential");
  }
}

// WebAuthn browser helpers
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function registerBiometric(deviceName?: string): Promise<boolean> {
  try {
    const options = await getWebAuthnRegistrationOptions();
    
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: base64urlToBuffer(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      authenticatorSelection: options.authenticatorSelection,
      timeout: options.timeout,
      excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
        id: base64urlToBuffer(cred.id),
        type: cred.type,
      })),
    };
    
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error("No credential created");
    }
    
    const response = credential.response as AuthenticatorAttestationResponse;
    
    const credentialData = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        attestationObject: bufferToBase64url(response.attestationObject),
        publicKey: bufferToBase64url(response.getPublicKey?.() || response.attestationObject),
        transports: response.getTransports?.() || [],
      },
    };
    
    await verifyWebAuthnRegistration(credentialData, deviceName);
    return true;
  } catch (error: any) {
    console.error("Biometric registration failed:", error);
    throw error;
  }
}

export async function loginWithBiometric(email?: string): Promise<any> {
  try {
    const options = await getWebAuthnLoginOptions(email);
    
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rpId: options.rpId,
      timeout: options.timeout,
      userVerification: options.userVerification as UserVerificationRequirement,
      allowCredentials: options.allowCredentials?.map((cred: any) => ({
        id: base64urlToBuffer(cred.id),
        type: cred.type,
      })),
    };
    
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error("No credential received");
    }
    
    const response = credential.response as AuthenticatorAssertionResponse;
    
    const credentialData = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        authenticatorData: bufferToBase64url(response.authenticatorData),
        signature: bufferToBase64url(response.signature),
        userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
      },
    };
    
    return await verifyWebAuthnLogin(credentialData, email);
  } catch (error: any) {
    console.error("Biometric login failed:", error);
    throw error;
  }
}

export function isBiometricSupported(): boolean {
  return window.PublicKeyCredential !== undefined;
}

// ==================== CRYPTO WALLET ====================

export interface CryptoWallet {
  evmAddress: string;
  tronAddress: string;
  seedBackedUp: boolean;
  createdAt: string;
}

export interface CryptoWalletCreated {
  mnemonic: string;
  evmAddress: string;
  tronAddress: string;
  message: string;
}

export interface CryptoBalances {
  balances: Record<string, string>;
  evmAddress: string;
  tronAddress: string;
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  rpcUrl: string;
  usdtContract: string;
  explorerUrl: string;
  type: string;
}

export async function getCryptoWallet(): Promise<CryptoWallet | null> {
  const response = await fetch(`${API_BASE}/crypto/wallet`);
  if (!response.ok) {
    throw new Error("Failed to get crypto wallet");
  }
  const data = await response.json();
  return data.wallet === null ? null : data;
}

export async function createCryptoWallet(password: string): Promise<CryptoWalletCreated> {
  const response = await fetch(`${API_BASE}/crypto/wallet/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create wallet");
  }
  return response.json();
}

export async function confirmWalletBackup(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/crypto/wallet/confirm-backup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to confirm backup");
  }
  return response.json();
}

export async function importCryptoWallet(mnemonic: string, password: string): Promise<{ evmAddress: string; tronAddress: string; message: string }> {
  const response = await fetch(`${API_BASE}/crypto/wallet/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mnemonic, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to import wallet");
  }
  return response.json();
}

export async function getCryptoBalances(): Promise<CryptoBalances> {
  const response = await fetch(`${API_BASE}/crypto/balances`);
  if (!response.ok) {
    throw new Error("Failed to get crypto balances");
  }
  return response.json();
}

export async function getSupportedNetworks(): Promise<Record<string, NetworkInfo>> {
  const response = await fetch(`${API_BASE}/crypto/networks`);
  if (!response.ok) {
    throw new Error("Failed to get supported networks");
  }
  return response.json();
}

export interface GasEstimate {
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCostNative: string;
  estimatedCostUsd: string;
  nativeSymbol: string;
  energy?: number;
  bandwidth?: number;
  estimatedTrx?: string;
}

export interface SendTransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}

export async function validateCryptoAddress(address: string, network: string): Promise<{ valid: boolean }> {
  const response = await fetch(`${API_BASE}/crypto/validate-address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, network }),
  });
  if (!response.ok) {
    throw new Error("Address validation failed");
  }
  return response.json();
}

export async function estimateCryptoGas(toAddress: string, amount: string, network: string): Promise<GasEstimate> {
  const response = await fetch(`${API_BASE}/crypto/estimate-gas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toAddress, amount, network }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to estimate gas");
  }
  return response.json();
}

export async function sendCryptoUsdt(
  toAddress: string, 
  amount: string, 
  network: string, 
  password: string
): Promise<SendTransactionResult> {
  const response = await fetch(`${API_BASE}/crypto/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toAddress, amount, network, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send USDT");
  }
  return response.json();
}

// Native token balances (for gas fees)
export interface NativeBalances {
  balances: Record<string, { balance: string; symbol: string }>;
}

export async function getNativeBalances(): Promise<NativeBalances> {
  const response = await fetch(`${API_BASE}/crypto/native-balances`);
  if (!response.ok) {
    throw new Error("Failed to get native balances");
  }
  return response.json();
}

// Crypto transaction history
export interface CryptoTransaction {
  id: string;
  userId: string;
  type: "send" | "receive";
  network: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  status: string;
  gasUsed?: string;
  gasFee?: string;
  explorerUrl?: string;
  createdAt: string;
}

export async function getCryptoTransactions(limit: number = 50): Promise<CryptoTransaction[]> {
  const response = await fetch(`${API_BASE}/crypto/transactions?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to get crypto transactions");
  }
  return response.json();
}

// Address book
export interface AddressBookEntry {
  id: string;
  userId: string;
  name: string;
  address: string;
  network: string;
  createdAt: string;
}

export async function getAddressBook(): Promise<AddressBookEntry[]> {
  const response = await fetch(`${API_BASE}/crypto/address-book`);
  if (!response.ok) {
    throw new Error("Failed to get address book");
  }
  return response.json();
}

export async function addAddressBookEntry(name: string, address: string, network: string): Promise<AddressBookEntry> {
  const response = await fetch(`${API_BASE}/crypto/address-book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, address, network }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add address");
  }
  return response.json();
}

export async function deleteAddressBookEntry(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/crypto/address-book/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete address");
  }
}
