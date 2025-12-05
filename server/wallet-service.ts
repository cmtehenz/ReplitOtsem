import { ethers } from "ethers";
import * as TronWeb from "tronweb";
import CryptoJS from "crypto-js";

const tronUtils = TronWeb.utils || (TronWeb as any).default?.utils || TronWeb;

const ENCRYPTION_ALGORITHM = "AES";

export interface WalletData {
  mnemonic: string;
  evmAddress: string;
  evmPrivateKey: string;
  tronAddress: string;
  tronPrivateKey: string;
}

export interface EncryptedWalletData {
  encryptedSeed: string;
  seedIv: string;
  evmAddress: string;
  tronAddress: string;
}

export function generateMnemonic(): string {
  const wallet = ethers.Wallet.createRandom();
  if (!wallet.mnemonic) {
    throw new Error("Failed to generate mnemonic");
  }
  return wallet.mnemonic.phrase;
}

export function deriveEvmWallet(mnemonic: string): { address: string; privateKey: string } {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export function deriveTronWallet(mnemonic: string): { address: string; privateKey: string } {
  const evmWallet = ethers.Wallet.fromPhrase(mnemonic);
  const privateKeyHex = evmWallet.privateKey.slice(2);
  
  const addressUtils = tronUtils.address || (tronUtils as any).default?.address;
  const tronAddress = addressUtils?.fromPrivateKey?.(privateKeyHex) || 
    generateTronAddressFromPrivateKey(privateKeyHex);
  
  return {
    address: tronAddress,
    privateKey: privateKeyHex,
  };
}

function generateTronAddressFromPrivateKey(privateKeyHex: string): string {
  const evmAddress = ethers.computeAddress("0x" + privateKeyHex);
  const addressBytes = ethers.getBytes(evmAddress);
  const tronAddressBytes = new Uint8Array(21);
  tronAddressBytes[0] = 0x41;
  tronAddressBytes.set(addressBytes.slice(addressBytes.length - 20), 1);
  return base58Encode(tronAddressBytes);
}

function base58Encode(buffer: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  
  const checksum = ethers.sha256(ethers.sha256(buffer));
  const checksumBytes = ethers.getBytes(checksum).slice(0, 4);
  const addressWithChecksum = new Uint8Array(buffer.length + 4);
  addressWithChecksum.set(buffer);
  addressWithChecksum.set(checksumBytes, buffer.length);
  
  let num = BigInt(0);
  for (let i = 0; i < addressWithChecksum.length; i++) {
    num = num * BigInt(256) + BigInt(addressWithChecksum[i]);
  }
  
  let encoded = "";
  while (num > 0) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    encoded = ALPHABET[remainder] + encoded;
  }
  
  for (let i = 0; i < addressWithChecksum.length; i++) {
    if (addressWithChecksum[i] !== 0) break;
    encoded = "1" + encoded;
  }
  
  return encoded;
}

export function generateWallet(): WalletData {
  const mnemonic = generateMnemonic();
  const evmWallet = deriveEvmWallet(mnemonic);
  const tronWallet = deriveTronWallet(mnemonic);
  
  return {
    mnemonic,
    evmAddress: evmWallet.address,
    evmPrivateKey: evmWallet.privateKey,
    tronAddress: tronWallet.address,
    tronPrivateKey: tronWallet.privateKey,
  };
}

export function importWalletFromMnemonic(mnemonic: string): WalletData {
  const trimmedMnemonic = mnemonic.trim().toLowerCase();
  const words = trimmedMnemonic.split(/\s+/);
  
  if (words.length !== 12 && words.length !== 24) {
    throw new Error("Invalid mnemonic: must be 12 or 24 words");
  }
  
  try {
    const evmWallet = deriveEvmWallet(trimmedMnemonic);
    const tronWallet = deriveTronWallet(trimmedMnemonic);
    
    return {
      mnemonic: trimmedMnemonic,
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      tronAddress: tronWallet.address,
      tronPrivateKey: tronWallet.privateKey,
    };
  } catch (error) {
    throw new Error("Invalid mnemonic phrase");
  }
}

export function encryptMnemonic(mnemonic: string, password: string): { encrypted: string; iv: string } {
  const iv = CryptoJS.lib.WordArray.random(16).toString();
  const key = CryptoJS.PBKDF2(password, iv, { keySize: 256 / 32, iterations: 10000 });
  const encrypted = CryptoJS.AES.encrypt(mnemonic, key.toString()).toString();
  
  return { encrypted, iv };
}

export function decryptMnemonic(encrypted: string, iv: string, password: string): string {
  try {
    const key = CryptoJS.PBKDF2(password, iv, { keySize: 256 / 32, iterations: 10000 });
    const decrypted = CryptoJS.AES.decrypt(encrypted, key.toString());
    const mnemonic = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!mnemonic || mnemonic.split(/\s+/).length < 12) {
      throw new Error("Invalid password or corrupted data");
    }
    
    return mnemonic;
  } catch (error) {
    throw new Error("Failed to decrypt wallet - incorrect password");
  }
}

export function createEncryptedWallet(password: string): EncryptedWalletData & { mnemonic: string } {
  const walletData = generateWallet();
  const { encrypted, iv } = encryptMnemonic(walletData.mnemonic, password);
  
  return {
    mnemonic: walletData.mnemonic,
    encryptedSeed: encrypted,
    seedIv: iv,
    evmAddress: walletData.evmAddress,
    tronAddress: walletData.tronAddress,
  };
}

export function importEncryptedWallet(mnemonic: string, password: string): EncryptedWalletData {
  const walletData = importWalletFromMnemonic(mnemonic);
  const { encrypted, iv } = encryptMnemonic(walletData.mnemonic, password);
  
  return {
    encryptedSeed: encrypted,
    seedIv: iv,
    evmAddress: walletData.evmAddress,
    tronAddress: walletData.tronAddress,
  };
}

export function getPrivateKeyFromEncryptedWallet(
  encryptedSeed: string, 
  seedIv: string, 
  password: string,
  network: "evm" | "tron"
): string {
  const mnemonic = decryptMnemonic(encryptedSeed, seedIv, password);
  
  if (network === "evm") {
    const evmWallet = deriveEvmWallet(mnemonic);
    return evmWallet.privateKey;
  } else {
    const tronWallet = deriveTronWallet(mnemonic);
    return tronWallet.privateKey;
  }
}

export const SUPPORTED_NETWORKS = {
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    usdtContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    explorer: "https://etherscan.io",
    type: "evm" as const,
  },
  polygon: {
    name: "Polygon",
    symbol: "MATIC",
    chainId: 137,
    rpcUrl: "https://polygon.llamarpc.com",
    usdtContract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    explorer: "https://polygonscan.com",
    type: "evm" as const,
  },
  bsc: {
    name: "BNB Smart Chain",
    symbol: "BNB",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org",
    usdtContract: "0x55d398326f99059fF775485246999027B3197955",
    explorer: "https://bscscan.com",
    type: "evm" as const,
  },
  arbitrum: {
    name: "Arbitrum One",
    symbol: "ETH",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    usdtContract: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    explorer: "https://arbiscan.io",
    type: "evm" as const,
  },
  optimism: {
    name: "Optimism",
    symbol: "ETH",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    usdtContract: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    explorer: "https://optimistic.etherscan.io",
    type: "evm" as const,
  },
  avalanche: {
    name: "Avalanche C-Chain",
    symbol: "AVAX",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    usdtContract: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    explorer: "https://snowtrace.io",
    type: "evm" as const,
  },
  tron: {
    name: "Tron",
    symbol: "TRX",
    chainId: 0,
    rpcUrl: "https://api.trongrid.io",
    usdtContract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    explorer: "https://tronscan.org",
    type: "tron" as const,
  },
};

export type NetworkKey = keyof typeof SUPPORTED_NETWORKS;

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export async function getUsdtBalance(
  address: string, 
  network: NetworkKey
): Promise<string> {
  const networkConfig = SUPPORTED_NETWORKS[network];
  
  try {
    if (networkConfig.type === "tron") {
      const response = await fetch(`https://apilist.tronscanapi.com/api/account/tokens?address=${address}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`);
      if (!response.ok) return "0.000000";
      const data = await response.json();
      const usdtToken = data.data?.find((t: any) => t.tokenId === "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
      const balance = usdtToken ? parseFloat(usdtToken.balance) / 1e6 : 0;
      return balance.toFixed(6);
    } else {
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      const contract = new ethers.Contract(networkConfig.usdtContract, ERC20_ABI, provider);
      
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
      ]);
      
      const formatted = ethers.formatUnits(balance, decimals);
      return parseFloat(formatted).toFixed(6);
    }
  } catch (error) {
    console.error(`Failed to get USDT balance on ${network}:`, error);
    return "0.000000";
  }
}

export async function getAllUsdtBalances(
  evmAddress: string,
  tronAddress: string
): Promise<Record<NetworkKey, string>> {
  const balances: Record<string, string> = {};
  
  const promises = Object.entries(SUPPORTED_NETWORKS).map(async ([key, config]) => {
    const address = config.type === "tron" ? tronAddress : evmAddress;
    try {
      balances[key] = await getUsdtBalance(address, key as NetworkKey);
    } catch {
      balances[key] = "0.000000";
    }
  });
  
  await Promise.all(promises);
  return balances as Record<NetworkKey, string>;
}

export async function getNativeBalance(
  address: string,
  network: NetworkKey
): Promise<string> {
  const networkConfig = SUPPORTED_NETWORKS[network];
  
  try {
    if (networkConfig.type === "tron") {
      const response = await fetch(`https://apilist.tronscanapi.com/api/account?address=${address}`);
      if (!response.ok) return "0.000000";
      const data = await response.json();
      const balance = data.balance ? parseFloat(data.balance) / 1e6 : 0;
      return balance.toFixed(6);
    } else {
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      const balance = await provider.getBalance(address);
      const formatted = ethers.formatEther(balance);
      return parseFloat(formatted).toFixed(6);
    }
  } catch (error) {
    console.error(`Failed to get native balance on ${network}:`, error);
    return "0.000000";
  }
}

export async function getAllNativeBalances(
  evmAddress: string,
  tronAddress: string
): Promise<Record<NetworkKey, { balance: string; symbol: string }>> {
  const balances: Record<string, { balance: string; symbol: string }> = {};
  
  const promises = Object.entries(SUPPORTED_NETWORKS).map(async ([key, config]) => {
    const address = config.type === "tron" ? tronAddress : evmAddress;
    try {
      const balance = await getNativeBalance(address, key as NetworkKey);
      balances[key] = { balance, symbol: config.symbol };
    } catch {
      balances[key] = { balance: "0.000000", symbol: config.symbol };
    }
  });
  
  await Promise.all(promises);
  return balances as Record<NetworkKey, { balance: string; symbol: string }>;
}

const ERC20_TRANSFER_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export function validateEvmAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function validateTronAddress(address: string): boolean {
  if (!address || address.length !== 34) return false;
  if (!address.startsWith('T')) return false;
  const base58Chars = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return base58Chars.test(address);
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCostNative: string;
  estimatedCostUsd: string;
  nativeSymbol: string;
}

export async function estimateEvmGas(
  fromAddress: string,
  toAddress: string,
  amount: string,
  network: NetworkKey
): Promise<GasEstimate> {
  const networkConfig = SUPPORTED_NETWORKS[network];
  if (networkConfig.type !== "evm") {
    throw new Error("Not an EVM network");
  }

  const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  const contract = new ethers.Contract(networkConfig.usdtContract, ERC20_TRANSFER_ABI, provider);
  
  const decimals = await contract.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);
  
  const gasLimit = await contract.transfer.estimateGas(toAddress, amountWei, { from: fromAddress })
    .catch(() => BigInt(100000));
  
  const feeData = await provider.getFeeData();
  
  const gasPrice = feeData.gasPrice || ethers.parseUnits("30", "gwei");
  const estimatedCost = gasLimit * gasPrice;
  const estimatedCostEth = ethers.formatEther(estimatedCost);
  
  const nativePriceUsd = networkConfig.symbol === "ETH" ? 2500 : 
                         networkConfig.symbol === "MATIC" ? 0.8 :
                         networkConfig.symbol === "BNB" ? 300 :
                         networkConfig.symbol === "AVAX" ? 35 : 2500;
  
  const estimatedCostUsd = (parseFloat(estimatedCostEth) * nativePriceUsd).toFixed(4);

  return {
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice.toString(),
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    estimatedCostNative: estimatedCostEth,
    estimatedCostUsd,
    nativeSymbol: networkConfig.symbol,
  };
}

export interface SendTransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}

export async function sendUsdtEvm(
  encryptedSeed: string,
  seedIv: string,
  password: string,
  toAddress: string,
  amount: string,
  network: NetworkKey
): Promise<SendTransactionResult> {
  const networkConfig = SUPPORTED_NETWORKS[network];
  if (networkConfig.type !== "evm") {
    return { success: false, error: "Not an EVM network" };
  }

  if (!validateEvmAddress(toAddress)) {
    return { success: false, error: "Invalid recipient address" };
  }

  try {
    const privateKey = getPrivateKeyFromEncryptedWallet(encryptedSeed, seedIv, password, "evm");
    
    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(networkConfig.usdtContract, ERC20_TRANSFER_ABI, wallet);
    
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    const balance = await contract.balanceOf(wallet.address);
    if (balance < amountWei) {
      return { success: false, error: "Insufficient USDT balance" };
    }
    
    const nativeBalance = await provider.getBalance(wallet.address);
    const feeData = await provider.getFeeData();
    const gasLimit = BigInt(100000);
    const gasPrice = feeData.gasPrice || ethers.parseUnits("30", "gwei");
    const requiredGas = gasLimit * gasPrice;
    
    if (nativeBalance < requiredGas) {
      return { 
        success: false, 
        error: `Insufficient ${networkConfig.symbol} for gas fees. Need approximately ${ethers.formatEther(requiredGas)} ${networkConfig.symbol}` 
      };
    }
    
    const tx = await contract.transfer(toAddress, amountWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash,
      explorerUrl: `${networkConfig.explorer}/tx/${receipt.hash}`,
    };
  } catch (error: any) {
    console.error("Send USDT EVM error:", error);
    return { 
      success: false, 
      error: error.message || "Transaction failed" 
    };
  }
}

export async function estimateTronEnergy(
  fromAddress: string,
  toAddress: string,
  amount: string
): Promise<{ energy: number; bandwidth: number; estimatedTrx: string; estimatedUsd: string }> {
  return {
    energy: 65000,
    bandwidth: 350,
    estimatedTrx: "15",
    estimatedUsd: "1.50",
  };
}

export async function sendUsdtTron(
  encryptedSeed: string,
  seedIv: string,
  password: string,
  toAddress: string,
  amount: string
): Promise<SendTransactionResult> {
  if (!validateTronAddress(toAddress)) {
    return { success: false, error: "Invalid Tron address" };
  }

  try {
    const privateKey = getPrivateKeyFromEncryptedWallet(encryptedSeed, seedIv, password, "tron");
    
    const TronWebClass = (TronWeb as any).default || TronWeb;
    const tronWeb = new TronWebClass({
      fullHost: "https://api.trongrid.io",
      privateKey: privateKey,
    });
    
    const usdtContract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    const amountSun = BigInt(Math.floor(parseFloat(amount) * 1e6));
    
    const contract = await tronWeb.contract().at(usdtContract);
    const result = await contract.transfer(toAddress, amountSun.toString()).send();
    
    return {
      success: true,
      txHash: result,
      explorerUrl: `https://tronscan.org/#/transaction/${result}`,
    };
  } catch (error: any) {
    console.error("Send USDT Tron error:", error);
    return { 
      success: false, 
      error: error.message || "Transaction failed" 
    };
  }
}
