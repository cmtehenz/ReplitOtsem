// API client for backend communication

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
  status: "pending" | "completed" | "failed";
  fromCurrency: "BRL" | "USDT" | "BTC" | null;
  toCurrency: "BRL" | "USDT" | "BTC" | null;
  fromAmount: string | null;
  toAmount: string | null;
  description: string;
  createdAt: string;
}

const API_BASE = "/api";

// Initialize demo user on first load
export async function initDemo(): Promise<{ userId: string }> {
  const response = await fetch(`${API_BASE}/init-demo`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to initialize demo");
  }
  return response.json();
}

// Get user wallets
export async function getWallets(userId: string = "demo-user"): Promise<Wallet[]> {
  const response = await fetch(`${API_BASE}/wallets?userId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch wallets");
  }
  return response.json();
}

// Get user transactions
export async function getTransactions(userId: string = "demo-user", limit: number = 20): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE}/transactions?userId=${userId}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}

// Execute exchange
export async function executeExchange(
  fromCurrency: string,
  toCurrency: string,
  fromAmount: string,
  toAmount: string,
  userId: string = "demo-user"
): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to execute exchange");
  }
  
  return response.json();
}
