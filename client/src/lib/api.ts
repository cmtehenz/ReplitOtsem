// API client for backend communication

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
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

// ==================== EXCHANGE ====================

export async function executeExchange(
  fromCurrency: string,
  toCurrency: string,
  fromAmount: string,
  toAmount: string
): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromCurrency, toCurrency, fromAmount, toAmount }),
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
