import { db } from "./db";
import { 
  users, wallets, transactions, userPixKeys, pixDeposits, pixWithdrawals, webhookLogs, notifications,
  type User, type InsertUser, type UpsertUser,
  type Wallet, type InsertWallet, 
  type Transaction, type InsertTransaction,
  type UserPixKey, type InsertPixKey,
  type PixDeposit, type InsertPixDeposit,
  type PixWithdrawal, type InsertPixWithdrawal,
  type WebhookLog, type InsertWebhookLog,
  type Notification, type InsertNotification
} from "@shared/schema";
import { eq, and, desc, or } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertSocialUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: { name?: string; email?: string; phone?: string; profilePhoto?: string; onboardingComplete?: boolean }): Promise<User>;
  validatePassword(user: User, password: string): Promise<boolean>;
  
  // Wallets
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWallet(userId: string, currency: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet>;
  creditWallet(userId: string, currency: string, amount: string): Promise<Wallet>;
  debitWallet(userId: string, currency: string, amount: string): Promise<Wallet>;
  
  // Transactions
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string, externalId?: string): Promise<Transaction>;
  
  // PIX Keys
  getUserPixKeys(userId: string): Promise<UserPixKey[]>;
  getPixKey(id: string): Promise<UserPixKey | undefined>;
  createPixKey(pixKey: InsertPixKey): Promise<UserPixKey>;
  deletePixKey(id: string, userId: string): Promise<void>;
  
  // PIX Deposits
  createPixDeposit(deposit: InsertPixDeposit): Promise<PixDeposit>;
  getPixDepositByTxid(txid: string): Promise<PixDeposit | undefined>;
  getPixDepositByE2eId(e2eId: string): Promise<PixDeposit | undefined>;
  updatePixDeposit(id: string, updates: Partial<PixDeposit>): Promise<PixDeposit>;
  getUserPendingDeposits(userId: string): Promise<PixDeposit[]>;
  
  // PIX Withdrawals
  createPixWithdrawal(withdrawal: InsertPixWithdrawal): Promise<PixWithdrawal>;
  getPixWithdrawal(id: string): Promise<PixWithdrawal | undefined>;
  updatePixWithdrawal(id: string, updates: Partial<PixWithdrawal>): Promise<PixWithdrawal>;
  getUserWithdrawals(userId: string): Promise<PixWithdrawal[]>;
  
  // Webhook logs
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogByHash(hash: string): Promise<WebhookLog | undefined>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, SALT_ROUNDS);
    
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    const user = result[0];
    
    // Create default wallets for new user with zero balance
    await this.createWallet({ userId: user.id, currency: "BRL", balance: "0" });
    await this.createWallet({ userId: user.id, currency: "USDT", balance: "0" });
    await this.createWallet({ userId: user.id, currency: "BTC", balance: "0" });
    
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async upsertSocialUser(userData: UpsertUser): Promise<User> {
    const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(" ") || "User";
    
    const [existingUser] = await db.select().from(users).where(eq(users.id, userData.id)).limit(1);
    
    if (existingUser) {
      const [updated] = await db.update(users)
        .set({
          email: userData.email || existingUser.email,
          name: fullName || existingUser.name,
          profilePhoto: userData.profileImageUrl || existingUser.profilePhoto,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return updated;
    }
    
    const [newUser] = await db.insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        name: fullName,
        profilePhoto: userData.profileImageUrl,
        authProvider: "replit",
      })
      .returning();
    
    await this.createWallet({ userId: newUser.id, currency: "BRL", balance: "0" });
    await this.createWallet({ userId: newUser.id, currency: "USDT", balance: "0" });
    await this.createWallet({ userId: newUser.id, currency: "BTC", balance: "0" });
    
    return newUser;
  }

  async updateUser(id: string, updates: { name?: string; email?: string; phone?: string; profilePhoto?: string; onboardingComplete?: boolean }): Promise<User> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    return result[0];
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

  async creditWallet(userId: string, currency: string, amount: string): Promise<Wallet> {
    const wallet = await this.getWallet(userId, currency);
    if (!wallet) {
      throw new Error(`Wallet not found for currency ${currency}`);
    }
    
    const newBalance = (parseFloat(wallet.balance) + parseFloat(amount)).toFixed(8);
    return this.updateWalletBalance(wallet.id, newBalance);
  }

  async debitWallet(userId: string, currency: string, amount: string): Promise<Wallet> {
    const wallet = await this.getWallet(userId, currency);
    if (!wallet) {
      throw new Error(`Wallet not found for currency ${currency}`);
    }
    
    const currentBalance = parseFloat(wallet.balance);
    const debitAmount = parseFloat(amount);
    
    if (currentBalance < debitAmount) {
      throw new Error("Insufficient balance");
    }
    
    const newBalance = (currentBalance - debitAmount).toFixed(8);
    return this.updateWalletBalance(wallet.id, newBalance);
  }

  // Transactions
  async getUserTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async updateTransactionStatus(id: string, status: string, externalId?: string): Promise<Transaction> {
    const updates: any = { 
      status: status as any,
      updatedAt: new Date(),
    };
    if (externalId) {
      updates.externalId = externalId;
    }
    
    const result = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  // PIX Keys
  async getUserPixKeys(userId: string): Promise<UserPixKey[]> {
    return await db.select().from(userPixKeys).where(eq(userPixKeys.userId, userId));
  }

  async getPixKey(id: string): Promise<UserPixKey | undefined> {
    const result = await db.select().from(userPixKeys).where(eq(userPixKeys.id, id)).limit(1);
    return result[0];
  }

  async createPixKey(pixKey: InsertPixKey): Promise<UserPixKey> {
    const result = await db.insert(userPixKeys).values(pixKey).returning();
    return result[0];
  }

  async deletePixKey(id: string, userId: string): Promise<void> {
    await db.delete(userPixKeys).where(
      and(eq(userPixKeys.id, id), eq(userPixKeys.userId, userId))
    );
  }

  // PIX Deposits
  async createPixDeposit(deposit: InsertPixDeposit): Promise<PixDeposit> {
    const result = await db.insert(pixDeposits).values(deposit).returning();
    return result[0];
  }

  async getPixDepositByTxid(txid: string): Promise<PixDeposit | undefined> {
    const result = await db.select().from(pixDeposits).where(eq(pixDeposits.txid, txid)).limit(1);
    return result[0];
  }

  async getPixDepositByE2eId(e2eId: string): Promise<PixDeposit | undefined> {
    const result = await db.select().from(pixDeposits).where(eq(pixDeposits.endToEndId, e2eId)).limit(1);
    return result[0];
  }

  async updatePixDeposit(id: string, updates: Partial<PixDeposit>): Promise<PixDeposit> {
    const result = await db.update(pixDeposits)
      .set(updates as any)
      .where(eq(pixDeposits.id, id))
      .returning();
    return result[0];
  }

  async getUserPendingDeposits(userId: string): Promise<PixDeposit[]> {
    return await db.select().from(pixDeposits)
      .where(and(
        eq(pixDeposits.userId, userId),
        eq(pixDeposits.status, "pending")
      ))
      .orderBy(desc(pixDeposits.createdAt));
  }

  // PIX Withdrawals
  async createPixWithdrawal(withdrawal: InsertPixWithdrawal): Promise<PixWithdrawal> {
    const result = await db.insert(pixWithdrawals).values(withdrawal).returning();
    return result[0];
  }

  async getPixWithdrawal(id: string): Promise<PixWithdrawal | undefined> {
    const result = await db.select().from(pixWithdrawals).where(eq(pixWithdrawals.id, id)).limit(1);
    return result[0];
  }

  async updatePixWithdrawal(id: string, updates: Partial<PixWithdrawal>): Promise<PixWithdrawal> {
    const result = await db.update(pixWithdrawals)
      .set(updates as any)
      .where(eq(pixWithdrawals.id, id))
      .returning();
    return result[0];
  }

  async getUserWithdrawals(userId: string): Promise<PixWithdrawal[]> {
    return await db.select().from(pixWithdrawals)
      .where(eq(pixWithdrawals.userId, userId))
      .orderBy(desc(pixWithdrawals.createdAt));
  }

  // Webhook logs
  async createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog> {
    const result = await db.insert(webhookLogs).values(log).returning();
    return result[0];
  }

  async getWebhookLogByHash(hash: string): Promise<WebhookLog | undefined> {
    const result = await db.select().from(webhookLogs).where(eq(webhookLogs.payloadHash, hash)).limit(1);
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

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ));
    return result.length;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification> {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, userId)
      ))
      .returning();
    
    if (!result[0]) {
      throw new Error("Notification not found");
    }
    return result[0];
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
