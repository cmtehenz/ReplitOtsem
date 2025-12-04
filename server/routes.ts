import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPixKeySchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import session from "express-session";
import { getInterClient } from "./inter-api";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import rateLimit from "express-rate-limit";

// Session type declaration
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const pixLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 PIX operations per hour
  message: { error: "Too many PIX operations. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Apply rate limiting to all API routes
  app.use("/api/", apiLimiter);
  
  // Session setup
  const PgSession = connectPgSimple(session);
  
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }));

  // ==================== AUTH ROUTES ====================
  
  // Register new user (with stricter rate limiting)
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const registerSchema = z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        cpf: z.string().optional(),
      });

      const data = registerSchema.parse(req.body);

      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser(data);
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Login (with stricter rate limiting)
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string(),
      });

      const { username, password } = loginSchema.parse(req.body);

      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await storage.validatePassword(user, password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name,
        verified: user.verified,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ==================== WALLET ROUTES ====================

  // Get user wallets
  app.get("/api/wallets", requireAuth, async (req, res) => {
    try {
      const wallets = await storage.getUserWallets(req.session.userId!);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // ==================== TRANSACTION ROUTES ====================

  // Get user transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const transactions = await storage.getUserTransactions(req.session.userId!, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Execute exchange
  app.post("/api/exchange", requireAuth, async (req, res) => {
    try {
      const exchangeSchema = z.object({
        fromCurrency: z.enum(["BRL", "USDT", "BTC"]),
        toCurrency: z.enum(["BRL", "USDT", "BTC"]),
        fromAmount: z.string(),
        toAmount: z.string(),
      });

      const data = exchangeSchema.parse(req.body);

      const transaction = await storage.executeExchange(
        req.session.userId!,
        data.fromCurrency,
        data.toCurrency,
        data.fromAmount,
        data.toAmount
      );

      res.json(transaction);
    } catch (error: any) {
      if (error.message === "Insufficient balance") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to execute exchange" });
    }
  });

  // ==================== PIX KEY ROUTES ====================

  // Get user PIX keys
  app.get("/api/pix-keys", requireAuth, async (req, res) => {
    try {
      const keys = await storage.getUserPixKeys(req.session.userId!);
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PIX keys" });
    }
  });

  // Add PIX key
  app.post("/api/pix-keys", requireAuth, async (req, res) => {
    try {
      const pixKeySchema = z.object({
        keyType: z.enum(["cpf", "cnpj", "email", "phone", "random"]),
        keyValue: z.string().min(1),
        name: z.string().optional(),
      });

      const data = pixKeySchema.parse(req.body);

      const key = await storage.createPixKey({
        userId: req.session.userId!,
        ...data,
      });

      res.json(key);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to add PIX key" });
    }
  });

  // Delete PIX key
  app.delete("/api/pix-keys/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePixKey(req.params.id, req.session.userId!);
      res.json({ message: "PIX key deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete PIX key" });
    }
  });

  // ==================== PIX DEPOSIT ROUTES ====================

  // Create PIX deposit (generate QR code) - with PIX rate limiting
  app.post("/api/pix/deposit", requireAuth, pixLimiter, async (req, res) => {
    try {
      const depositSchema = z.object({
        amount: z.string().refine((val) => parseFloat(val) >= 1, "Minimum amount is R$ 1.00"),
      });

      const { amount } = depositSchema.parse(req.body);
      const userId = req.session.userId!;

      // Generate unique txid
      const txid = `OTSEM${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      try {
        // Create PIX charge with Banco Inter
        const interClient = getInterClient();
        const charge = await interClient.createPixCharge(txid, {
          calendario: {
            expiracao: 3600, // 1 hour expiration
          },
          valor: {
            original: parseFloat(amount).toFixed(2),
          },
          chave: process.env.INTER_PIX_KEY || "", // Company's PIX key
          solicitacaoPagador: "Depósito Otsem Pay",
        });

        // Create deposit record
        const deposit = await storage.createPixDeposit({
          userId,
          txid,
          amount,
          status: "pending",
          expiresAt: new Date(Date.now() + 3600 * 1000),
        });

        // Update with QR code data
        await storage.updatePixDeposit(deposit.id, {
          pixCopiaECola: charge.pixCopiaECola,
        });

        // Create pending transaction
        const transaction = await storage.createTransaction({
          userId,
          type: "deposit",
          status: "pending",
          toCurrency: "BRL",
          toAmount: amount,
          description: `PIX deposit of R$ ${amount}`,
          externalId: txid,
        });

        res.json({
          id: deposit.id,
          txid,
          amount,
          pixCopiaECola: charge.pixCopiaECola,
          expiresAt: deposit.expiresAt,
        });
      } catch (apiError: any) {
        console.error("Inter API error:", apiError.response?.data || apiError.message);
        
        // Create deposit record without Inter API (fallback for testing)
        const deposit = await storage.createPixDeposit({
          userId,
          txid,
          amount,
          status: "pending",
          expiresAt: new Date(Date.now() + 3600 * 1000),
        });

        res.json({
          id: deposit.id,
          txid,
          amount,
          pixCopiaECola: `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${parseFloat(amount).toFixed(2)}5802BR`,
          expiresAt: deposit.expiresAt,
          warning: "Using fallback mode - Inter API unavailable",
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create deposit" });
    }
  });

  // Get pending deposits
  app.get("/api/pix/deposits/pending", requireAuth, async (req, res) => {
    try {
      const deposits = await storage.getUserPendingDeposits(req.session.userId!);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deposits" });
    }
  });

  // ==================== PIX WITHDRAWAL ROUTES ====================

  // Create PIX withdrawal - with PIX rate limiting
  app.post("/api/pix/withdraw", requireAuth, pixLimiter, async (req, res) => {
    try {
      const withdrawSchema = z.object({
        pixKeyId: z.string(),
        amount: z.string().refine((val) => parseFloat(val) >= 1, "Minimum amount is R$ 1.00"),
      });

      const { pixKeyId, amount } = withdrawSchema.parse(req.body);
      const userId = req.session.userId!;

      // Get PIX key
      const pixKey = await storage.getPixKey(pixKeyId);
      if (!pixKey || pixKey.userId !== userId) {
        return res.status(404).json({ error: "PIX key not found" });
      }

      // Check balance
      const wallet = await storage.getWallet(userId, "BRL");
      if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Debit wallet immediately
      await storage.debitWallet(userId, "BRL", amount);

      // Create withdrawal record
      const withdrawal = await storage.createPixWithdrawal({
        userId,
        pixKeyId,
        amount,
        status: "processing",
      });

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        status: "processing",
        fromCurrency: "BRL",
        fromAmount: amount,
        description: `PIX withdrawal to ${pixKey.keyValue}`,
      });

      // Update withdrawal with transaction ID
      await storage.updatePixWithdrawal(withdrawal.id, {
        transactionId: transaction.id,
      });

      try {
        // Send PIX via Banco Inter
        const interClient = getInterClient();
        const result = await interClient.sendPixWithdrawal({
          valor: parseFloat(amount).toFixed(2),
          chave: pixKey.keyValue,
          descricao: "Saque Otsem Pay",
        });

        // Update withdrawal with e2e ID
        await storage.updatePixWithdrawal(withdrawal.id, {
          endToEndId: result.endToEndId,
          status: "completed",
          processedAt: new Date(),
        });

        await storage.updateTransactionStatus(transaction.id, "completed", result.endToEndId);

        res.json({
          id: withdrawal.id,
          amount,
          status: "completed",
          endToEndId: result.endToEndId,
        });
      } catch (apiError: any) {
        console.error("Inter API withdrawal error:", apiError.response?.data || apiError.message);

        // Mark as failed and refund
        await storage.updatePixWithdrawal(withdrawal.id, {
          status: "failed",
          failureReason: apiError.response?.data?.message || "API error",
        });

        await storage.updateTransactionStatus(transaction.id, "failed");

        // Refund the balance
        await storage.creditWallet(userId, "BRL", amount);

        res.status(500).json({ 
          error: "Withdrawal failed",
          reason: "Unable to process PIX transfer. Your balance has been refunded.",
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      if (error.message === "Insufficient balance") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  // Get user withdrawals
  app.get("/api/pix/withdrawals", requireAuth, async (req, res) => {
    try {
      const withdrawals = await storage.getUserWithdrawals(req.session.userId!);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  // ==================== PIX WEBHOOK ====================

  // PIX payment webhook from Banco Inter
  app.post("/api/webhooks/pix", async (req, res) => {
    try {
      const payload = JSON.stringify(req.body);
      const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");

      // Check idempotency
      const existingLog = await storage.getWebhookLogByHash(payloadHash);
      if (existingLog) {
        console.log("Duplicate webhook received, ignoring");
        return res.status(200).json({ message: "Already processed" });
      }

      // Log webhook
      await storage.createWebhookLog({
        eventType: "pix_received",
        externalId: req.body.endToEndId || req.body.txid || "unknown",
        payload,
        payloadHash,
        processed: false,
      });

      // Process PIX payment
      const { pix } = req.body;
      
      if (pix && Array.isArray(pix)) {
        for (const payment of pix) {
          const { endToEndId, txid, valor, pagador } = payment;

          // Find deposit by txid
          const deposit = await storage.getPixDepositByTxid(txid);
          if (deposit && deposit.status === "pending") {
            // Update deposit
            await storage.updatePixDeposit(deposit.id, {
              endToEndId,
              status: "completed",
              payerName: pagador?.nome,
              payerCpf: pagador?.cpf,
              paidAt: new Date(),
            });

            // Credit user's BRL wallet
            await storage.creditWallet(deposit.userId, "BRL", valor);

            // Update transaction
            const transactions = await storage.getUserTransactions(deposit.userId, 100);
            const pendingTx = transactions.find(t => t.externalId === txid && t.status === "pending");
            if (pendingTx) {
              await storage.updateTransactionStatus(pendingTx.id, "completed", endToEndId);
            }

            console.log(`PIX deposit confirmed: ${valor} BRL for user ${deposit.userId}`);
          }
        }
      }

      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  return httpServer;
}
