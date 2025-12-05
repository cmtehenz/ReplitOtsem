import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with proper password hashing support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // bcrypt hashed
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  cpf: text("cpf"), // Brazilian CPF for PIX
  profilePhoto: text("profile_photo"), // Base64 or URL
  verified: boolean("verified").default(false),
  // 2FA fields
  twoFactorSecret: text("two_factor_secret"), // TOTP secret key
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  backupCodes: text("backup_codes"), // JSON array of hashed backup codes
  passwordChangedAt: timestamp("password_changed_at"),
  // KYC fields
  kycLevel: text("kyc_level").default("none"), // none, basic, full
  kycVerifiedAt: timestamp("kyc_verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, verified: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// KYC level enum
export const kycLevelEnum = pgEnum("kyc_level", ["none", "basic", "full"]);

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
  "transfer_sent",
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

// Referral codes - anonymous random codes for referral program
export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  code: text("code").notNull().unique(), // Random code like OTSEM-A7B3C9
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({ id: true, createdAt: true });
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;

// Referrals - tracks who was referred by whom (anonymously)
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // The person who shared the code
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id).unique(), // The new user
  referralCodeId: varchar("referral_code_id").notNull().references(() => referralCodes.id),
  status: text("status").default("pending"), // pending, active, rewarded
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true });
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Login sessions - tracks user login history
export const loginSessions = pgTable("login_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceInfo: text("device_info"), // Browser/device identifier
  ipAddress: text("ip_address"),
  location: text("location"), // Parsed from IP (city, country)
  sessionId: text("session_id"), // Reference to express session
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
});

export const insertLoginSessionSchema = createInsertSchema(loginSessions).omit({ id: true, createdAt: true, lastActiveAt: true });
export type InsertLoginSession = z.infer<typeof insertLoginSessionSchema>;
export type LoginSession = typeof loginSessions.$inferSelect;

// KYC documents - stores submitted KYC documents
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentType: text("document_type").notNull(), // selfie, id_front, id_back, proof_of_address
  documentUrl: text("document_url").notNull(), // S3 or storage URL
  status: text("status").default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;

// Crypto addresses - stores user crypto wallet addresses for deposits
export const cryptoAddresses = pgTable("crypto_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  currency: text("currency").notNull(), // USDT, BTC, ETH, etc.
  network: text("network").notNull(), // TRC20, ERC20, BTC, etc.
  address: text("address").notNull(),
  memo: text("memo"), // For networks that require memo/tag
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCryptoAddressSchema = createInsertSchema(cryptoAddresses).omit({ id: true, createdAt: true });
export type InsertCryptoAddress = z.infer<typeof insertCryptoAddressSchema>;
export type CryptoAddress = typeof cryptoAddresses.$inferSelect;

// Referral rewards - tracks rewards earned from referrals
export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  referralId: varchar("referral_id").notNull().references(() => referrals.id),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").default("BRL"),
  status: text("status").default("pending"), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({ id: true, createdAt: true, paidAt: true });
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

// Email verification tokens
export const emailVerifications = pgTable("email_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({ id: true, createdAt: true, verifiedAt: true });
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerifications.$inferSelect;

// Password reset tokens
export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPasswordResetSchema = createInsertSchema(passwordResets).omit({ id: true, createdAt: true, usedAt: true });
export type InsertPasswordReset = z.infer<typeof insertPasswordResetSchema>;
export type PasswordReset = typeof passwordResets.$inferSelect;

// Crypto Wallets - stores encrypted seed phrases and wallet data for non-custodial wallets
export const cryptoWallets = pgTable("crypto_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  encryptedSeed: text("encrypted_seed").notNull(), // AES encrypted mnemonic
  seedIv: text("seed_iv").notNull(), // Initialization vector for AES
  evmAddress: text("evm_address").notNull(), // ETH/EVM address (same for all EVM chains)
  tronAddress: text("tron_address").notNull(), // Tron address (TRC20)
  seedBackedUp: boolean("seed_backed_up").default(false), // User has confirmed backup
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({ id: true, createdAt: true });
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;

// WebAuthn credentials - stores passkeys/biometric login credentials
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  credentialId: text("credential_id").notNull().unique(), // Base64 encoded credential ID
  publicKey: text("public_key").notNull(), // Base64 encoded public key
  counter: decimal("counter", { precision: 20, scale: 0 }).notNull().default("0"),
  deviceType: text("device_type"), // platform, cross-platform
  deviceName: text("device_name"), // e.g., "iPhone", "MacBook", etc.
  transports: text("transports"), // JSON array of transports
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export const insertWebAuthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({ id: true, createdAt: true, lastUsedAt: true });
export type InsertWebAuthnCredential = z.infer<typeof insertWebAuthnCredentialSchema>;
export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;
