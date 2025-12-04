import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, pgEnum, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Auth provider enum
export const authProviderEnum = pgEnum("auth_provider", ["local", "replit"]);

// Users table with support for both local and social auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(), // Optional for social login
  password: text("password"), // Optional for social login (bcrypt hashed)
  authProvider: authProviderEnum("auth_provider").default("local"),
  name: text("name").notNull(),
  email: text("email").unique(), // Optional for some OAuth providers
  phone: text("phone"),
  cpf: text("cpf"), // Brazilian CPF for PIX
  profilePhoto: text("profile_photo"), // Base64 or URL from OAuth
  verified: boolean("verified").default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, verified: true, onboardingComplete: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Type for Replit Auth upsert
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

// Currency types
export const currencyEnum = pgEnum("currency", ["BRL", "USDT", "BTC"]);

// Wallets - each user has balances for different currencies
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  currency: currencyEnum("currency").notNull(),
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default("0"),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// Transaction types
export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdrawal",
  "exchange",
  "transfer"
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled"
]);

// Transactions - all wallet activity
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  fromCurrency: currencyEnum("from_currency"),
  toCurrency: currencyEnum("to_currency"),
  fromAmount: decimal("from_amount", { precision: 18, scale: 8 }),
  toAmount: decimal("to_amount", { precision: 18, scale: 8 }),
  description: text("description").notNull(),
  externalId: text("external_id"), // PIX e2e ID or txid
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// PIX Key types
export const pixKeyTypeEnum = pgEnum("pix_key_type", ["cpf", "cnpj", "email", "phone", "random"]);

// User PIX Keys for withdrawals
export const userPixKeys = pgTable("user_pix_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  keyType: pixKeyTypeEnum("key_type").notNull(),
  keyValue: text("key_value").notNull(),
  name: text("name"), // Optional nickname for the key
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPixKeySchema = createInsertSchema(userPixKeys).omit({ id: true, createdAt: true, verified: true });
export type InsertPixKey = z.infer<typeof insertPixKeySchema>;
export type UserPixKey = typeof userPixKeys.$inferSelect;

// PIX Deposits - tracking incoming payments
export const pixDeposits = pgTable("pix_deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  txid: text("txid").notNull().unique(), // PIX charge ID
  endToEndId: text("end_to_end_id").unique(), // PIX payment e2e ID
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  pixCopiaECola: text("pix_copia_e_cola"), // QR code data
  payerName: text("payer_name"),
  payerCpf: text("payer_cpf"),
  expiresAt: timestamp("expires_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPixDepositSchema = createInsertSchema(pixDeposits).omit({ 
  id: true, 
  createdAt: true,
  paidAt: true,
  transactionId: true,
  endToEndId: true,
  pixCopiaECola: true,
  payerName: true,
  payerCpf: true
});
export type InsertPixDeposit = z.infer<typeof insertPixDepositSchema>;
export type PixDeposit = typeof pixDeposits.$inferSelect;

// PIX Withdrawals - tracking outgoing payments
export const pixWithdrawals = pgTable("pix_withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  pixKeyId: varchar("pix_key_id").references(() => userPixKeys.id),
  endToEndId: text("end_to_end_id").unique(), // PIX payment e2e ID
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertPixWithdrawalSchema = createInsertSchema(pixWithdrawals).omit({ 
  id: true, 
  createdAt: true,
  processedAt: true,
  endToEndId: true,
  transactionId: true,
  failureReason: true
});
export type InsertPixWithdrawal = z.infer<typeof insertPixWithdrawalSchema>;
export type PixWithdrawal = typeof pixWithdrawals.$inferSelect;

// Webhook logs for idempotency and audit
export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  externalId: text("external_id").notNull(), // e2e ID or txid
  payload: text("payload").notNull(), // JSON stringified
  payloadHash: text("payload_hash").notNull().unique(), // For idempotency
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({ id: true, createdAt: true });
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;

// Notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "deposit_pending",
  "deposit_completed",
  "deposit_failed",
  "withdrawal_pending",
  "withdrawal_completed",
  "withdrawal_failed",
  "exchange_completed",
  "exchange_failed",
  "security_alert",
  "system"
]);

// User notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON stringified extra data (amount, txid, etc.)
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, read: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
