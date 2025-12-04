import { db } from "./db";
import { users, wallets, transactions, type User, type InsertUser, type Wallet, type InsertWallet, type Transaction, type InsertTransaction } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallets
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWallet(userId: string, currency: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet>;
  
  // Transactions
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Exchange operations
  executeExchange(
    userId: string,
    fromCurrency: string,
    toCurrency: string,
    fromAmount: string,
    toAmount: string
  ): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    const user = result[0];
    
    // Create default wallets for new user
    await this.createWallet({ userId: user.id, currency: "BRL", balance: "5000.00" });
    await this.createWallet({ userId: user.id, currency: "USDT", balance: "1420.00" });
    await this.createWallet({ userId: user.id, currency: "BTC", balance: "0.0045" });
    
    return user;
  }

  // Wallets
  async getUserWallets(userId: string): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async getWallet(userId: string, currency: string): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets)
      .where(and(
        eq(wallets.userId, userId), 
        eq(wallets.currency, currency as "BRL" | "USDT" | "BTC")
      ))
      .limit(1);
    return result[0];
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const result = await db.insert(wallets).values(wallet).returning();
    return result[0];
  }

  async updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet> {
    const result = await db.update(wallets)
      .set({ balance: newBalance })
      .where(eq(wallets.id, walletId))
      .returning();
    return result[0];
  }

  // Transactions
  async getUserTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  // Exchange operations
  async executeExchange(
    userId: string,
    fromCurrency: string,
    toCurrency: string,
    fromAmount: string,
    toAmount: string
  ): Promise<Transaction> {
    return await db.transaction(async (tx: any) => {
      // Get wallets
      const fromWalletResult = await tx.select().from(wallets)
        .where(and(
          eq(wallets.userId, userId), 
          eq(wallets.currency, fromCurrency as "BRL" | "USDT" | "BTC")
        ))
        .limit(1);
      const toWalletResult = await tx.select().from(wallets)
        .where(and(
          eq(wallets.userId, userId), 
          eq(wallets.currency, toCurrency as "BRL" | "USDT" | "BTC")
        ))
        .limit(1);

      if (!fromWalletResult[0] || !toWalletResult[0]) {
        throw new Error("Wallet not found");
      }

      const fromWallet = fromWalletResult[0];
      const toWallet = toWalletResult[0];

      // Check sufficient balance
      const currentBalance = parseFloat(fromWallet.balance);
      const amountToDeduct = parseFloat(fromAmount);

      if (currentBalance < amountToDeduct) {
        throw new Error("Insufficient balance");
      }

      // Update balances
      const newFromBalance = (currentBalance - amountToDeduct).toFixed(8);
      const newToBalance = (parseFloat(toWallet.balance) + parseFloat(toAmount)).toFixed(8);

      await tx.update(wallets)
        .set({ balance: newFromBalance })
        .where(eq(wallets.id, fromWallet.id));

      await tx.update(wallets)
        .set({ balance: newToBalance })
        .where(eq(wallets.id, toWallet.id));

      // Create transaction record
      const transactionResult = await tx.insert(transactions).values({
        userId,
        type: "exchange",
        status: "completed",
        fromCurrency: fromCurrency as "BRL" | "USDT" | "BTC",
        toCurrency: toCurrency as "BRL" | "USDT" | "BTC",
        fromAmount,
        toAmount,
        description: `Exchanged ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`,
      }).returning();

      return transactionResult[0];
    });
  }
}

export const storage = new DatabaseStorage();
