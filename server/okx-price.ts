import axios from "axios";

interface OkxTickerResponse {
  code: string;
  msg: string;
  data: Array<{
    instId: string;
    last: string;
    askPx: string;
    bidPx: string;
    high24h: string;
    low24h: string;
    vol24h: string;
    ts: string;
  }>;
}

interface CachedRate {
  rate: number;
  timestamp: number;
}

const CACHE_TTL_MS = 60000; // 60 seconds cache
const FEE_PERCENTAGE = 0.0095; // 0.95% fee

let cachedRate: CachedRate | null = null;

export async function getUsdtBrlRate(): Promise<number> {
  const now = Date.now();

  if (cachedRate && now - cachedRate.timestamp < CACHE_TTL_MS) {
    return cachedRate.rate;
  }

  try {
    const response = await axios.get<OkxTickerResponse>(
      "https://www.okx.com/api/v5/market/ticker?instId=USDT-BRL",
      {
        timeout: 10000,
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (response.data.code !== "0" || !response.data.data?.[0]) {
      throw new Error(`OKX API error: ${response.data.msg || "No data"}`);
    }

    const ticker = response.data.data[0];
    const rate = parseFloat(ticker.last);

    if (isNaN(rate) || rate <= 0) {
      throw new Error("Invalid rate received from OKX");
    }

    cachedRate = {
      rate,
      timestamp: now,
    };

    return rate;
  } catch (error) {
    if (cachedRate) {
      console.warn("OKX API failed, using cached rate:", error);
      return cachedRate.rate;
    }
    throw new Error("Failed to fetch exchange rate");
  }
}

export function applyFee(baseRate: number, direction: "buy" | "sell"): number {
  if (direction === "buy") {
    return baseRate * (1 + FEE_PERCENTAGE);
  } else {
    return baseRate * (1 - FEE_PERCENTAGE);
  }
}

export async function getExchangeRates(): Promise<{
  baseRate: number;
  buyRate: number;
  sellRate: number;
  feePercentage: number;
  cacheAge: number;
}> {
  const baseRate = await getUsdtBrlRate();
  const cacheAge = cachedRate ? Date.now() - cachedRate.timestamp : 0;

  return {
    baseRate,
    buyRate: applyFee(baseRate, "buy"),
    sellRate: applyFee(baseRate, "sell"),
    feePercentage: FEE_PERCENTAGE * 100,
    cacheAge,
  };
}

export function calculateExchange(
  amount: number,
  fromCurrency: "BRL" | "USDT",
  rate: number
): { toAmount: number; fee: number } {
  if (fromCurrency === "BRL") {
    const baseAmount = amount / rate;
    const fee = baseAmount * FEE_PERCENTAGE;
    return {
      toAmount: baseAmount - fee,
      fee,
    };
  } else {
    const baseAmount = amount * rate;
    const fee = baseAmount * FEE_PERCENTAGE;
    return {
      toAmount: baseAmount - fee,
      fee,
    };
  }
}

export const MIN_USDT_AMOUNT = 10;

export function validateExchangeAmount(
  amount: number,
  fromCurrency: "BRL" | "USDT",
  rate: number
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: "Amount must be greater than zero" };
  }

  let usdtEquivalent: number;
  if (fromCurrency === "USDT") {
    usdtEquivalent = amount;
  } else {
    usdtEquivalent = amount / rate;
  }

  if (usdtEquivalent < MIN_USDT_AMOUNT) {
    const minBrl = MIN_USDT_AMOUNT * rate;
    return {
      valid: false,
      error: `Minimum exchange is ${MIN_USDT_AMOUNT} USDT (≈ R$ ${minBrl.toFixed(2)})`,
    };
  }

  return { valid: true };
}
