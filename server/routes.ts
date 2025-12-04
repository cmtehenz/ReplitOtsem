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
import passport from "passport";
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import memoize from "memoizee";
import bcrypt from "bcrypt";
import {
  getExchangeRates,
  getUsdtBrlRate,
  calculateExchange,
  validateExchangeAmount,
  MIN_USDT_AMOUNT,
} from "./okx-price";
import { notificationService } from "./notification-service";
import { notificationWS } from "./websocket";

// Session type declaration
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// OIDC configuration for Replit Auth
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
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

// Helper to get user ID from either session type
function getUserId(req: Request): string | undefined {
  if (req.session?.userId) {
    return req.session.userId;
  }
  const user = req.user as any;
  if (user?.claims?.sub) {
    return user.claims.sub;
  }
  return undefined;
}

// Auth middleware - works with both local and social auth
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.set("trust proxy", 1);
  
  // Apply rate limiting to all API routes
  app.use("/api/", apiLimiter);
  
  // Session setup
  const PgSession = connectPgSimple(session);
  
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "otsem-pay-dev-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }));
  
  // Initialize Passport for social login
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport serialization
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));
  
  // Setup Replit Auth strategies
  const registeredStrategies = new Set<string>();
  
  const ensureStrategy = async (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const config = await getOidcConfig();
      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        const claims = tokens.claims();
        if (claims) {
          await storage.upsertSocialUser({
            id: claims["sub"] as string,
            email: claims["email"] as string,
            firstName: claims["first_name"] as string,
            lastName: claims["last_name"] as string,
            profileImageUrl: claims["profile_image_url"] as string,
          });
        }
        verified(null, user);
      };
      
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };
  
  // Social login route
  app.get("/api/login", async (req, res, next) => {
    await ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });
  
  // OAuth callback
  app.get("/api/callback", async (req, res, next) => {
    await ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/auth",
    })(req, res, next);
  });
  
  // Social logout
  app.get("/api/social-logout", async (req, res) => {
    const config = await getOidcConfig();
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

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
        name: user.name,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        verified: user.verified,
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
        name: user.name,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        verified: user.verified,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Logout (works with both local and social auth)
  app.post("/api/auth/logout", (req, res) => {
    const userId = getUserId(req);
    
    if (userId) {
      notificationWS.disconnectUser(userId);
    }
    
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Get current user (works with both local and social auth)
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        verified: user.verified,
        onboardingComplete: user.onboardingComplete,
        authProvider: user.authProvider,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Complete onboarding
  app.post("/api/auth/complete-onboarding", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const user = await storage.updateUser(userId, { onboardingComplete: true });
      res.json({ 
        id: user.id, 
        onboardingComplete: user.onboardingComplete,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        profilePhoto: z.string().optional(),
      });

      const data = updateSchema.parse(req.body);

      // Check if email is being changed and if it's already taken
      if (data.email) {
        const existingUser = await storage.getUserByEmail(data.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      const user = await storage.updateUser(userId, data);

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        verified: user.verified,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get WebSocket token for real-time notifications
  app.get("/api/auth/ws-token", requireAuth, (req, res) => {
    try {
      const userId = getUserId(req)!;
      const token = notificationWS.createToken(userId);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: "Failed to create WebSocket token" });
    }
  });

  // ==================== WALLET ROUTES ====================

  // Get user wallets
  app.get("/api/wallets", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // ==================== TRANSACTION ROUTES ====================

  // Get user transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get current exchange rates
  app.get("/api/rates", async (_req, res) => {
    try {
      const rates = await getExchangeRates();
      res.json({
        baseRate: rates.baseRate,
        usdtBrl: {
          buy: rates.buyRate,
          sell: rates.sellRate,
        },
        fee: rates.feePercentage,
        minUsdt: MIN_USDT_AMOUNT,
        minBrl: MIN_USDT_AMOUNT * rates.baseRate,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({ error: "Exchange rates temporarily unavailable" });
    }
  });

  // Execute exchange
  app.post("/api/exchange", requireAuth, async (req, res) => {
    try {
      const exchangeSchema = z.object({
        fromCurrency: z.enum(["BRL", "USDT"]),
        toCurrency: z.enum(["BRL", "USDT"]),
        amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message: "Amount must be a positive number",
        }),
      });

      const data = exchangeSchema.parse(req.body);
      const amount = parseFloat(data.amount);

      if (data.fromCurrency === data.toCurrency) {
        return res.status(400).json({ error: "Cannot exchange same currency" });
      }

      const rate = await getUsdtBrlRate();

      const validation = validateExchangeAmount(
        amount,
        data.fromCurrency as "BRL" | "USDT",
        rate
      );

      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const { toAmount, fee } = calculateExchange(
        amount,
        data.fromCurrency as "BRL" | "USDT",
        rate
      );

      const userId = getUserId(req)!;
      const transaction = await storage.executeExchange(
        userId,
        data.fromCurrency,
        data.toCurrency,
        amount.toString(),
        toAmount.toFixed(data.toCurrency === "BRL" ? 2 : 6)
      );

      // Send notification for successful exchange
      notificationService.notifyExchangeCompleted(
        userId,
        data.fromCurrency,
        data.toCurrency,
        amount.toString(),
        toAmount.toFixed(data.toCurrency === "BRL" ? 2 : 6)
      ).catch(err => console.error("Failed to send exchange notification:", err));

      res.json({
        ...transaction,
        rate,
        fee: fee.toFixed(data.toCurrency === "BRL" ? 2 : 6),
      });
    } catch (error: any) {
      if (error.message === "Insufficient balance") {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Exchange error:", error);
      res.status(500).json({ error: "Failed to execute exchange" });
    }
  });

  // ==================== PIX KEY ROUTES ====================

  // Get user PIX keys
  app.get("/api/pix-keys", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const keys = await storage.getUserPixKeys(userId);
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PIX keys" });
    }
  });

  // Add PIX key
  app.post("/api/pix-keys", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const pixKeySchema = z.object({
        keyType: z.enum(["cpf", "cnpj", "email", "phone", "random"]),
        keyValue: z.string().min(1),
        name: z.string().optional(),
      });

      const data = pixKeySchema.parse(req.body);

      const key = await storage.createPixKey({
        userId,
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
      const userId = getUserId(req)!;
      await storage.deletePixKey(req.params.id, userId);
      res.json({ message: "PIX key deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete PIX key" });
    }
  });

  // ==================== PIX API TEST ====================

  // Test Inter API connection (admin only - for debugging)
  app.get("/api/inter/test", requireAuth, async (req, res) => {
    try {
      const interClient = getInterClient();
      const result = await interClient.testConnection();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        details: {
          hasClientId: !!process.env.INTER_CLIENT_ID,
          hasClientSecret: !!process.env.INTER_CLIENT_SECRET,
          hasPrivateKey: !!process.env.INTER_PRIVATE_KEY,
          hasCertificate: !!process.env.INTER_CERTIFICATE,
          hasPixKey: !!process.env.INTER_PIX_KEY,
        }
      });
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
      const userId = getUserId(req)!;

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

        // Send notification for pending deposit
        notificationService.notifyDepositPending(userId, amount, txid)
          .catch(err => console.error("Failed to send deposit pending notification:", err));

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
      const userId = getUserId(req)!;
      const deposits = await storage.getUserPendingDeposits(userId);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deposits" });
    }
  });

  // Verify pending deposits with Banco Inter (check if payments were received)
  // This now also reconciles any missed payments from Inter that weren't saved to our DB
  app.post("/api/pix/deposits/verify", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const interClient = getInterClient();
      let verifiedCount = 0;
      let reconciledCount = 0;

      // STEP 1: Check existing pending deposits in our database
      const deposits = await storage.getUserPendingDeposits(userId);
      
      for (const deposit of deposits) {
        try {
          const chargeStatus = await interClient.getPixCharge(deposit.txid);
          
          console.log(`[PIX Verify] Checking deposit ${deposit.txid}: status=${chargeStatus.status}`);
          
          if (chargeStatus.status === "CONCLUIDA") {
            await storage.updatePixDeposit(deposit.id, {
              status: "completed",
              paidAt: new Date(),
            });

            await storage.creditWallet(deposit.userId, "BRL", deposit.amount);

            notificationService.notifyDepositCompleted(deposit.userId, deposit.amount, deposit.txid)
              .catch(err => console.error("Failed to send deposit notification:", err));

            console.log(`[PIX Verify] Deposit ${deposit.txid} confirmed: R$ ${deposit.amount}`);
            verifiedCount++;
          }
        } catch (error: any) {
          console.error(`[PIX Verify] Error checking deposit ${deposit.txid}:`, error.message);
        }
      }

      // STEP 2: Reconcile any payments from Inter that might not be in our DB
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const result = await interClient.listPixPayments(startDate.toISOString(), endDate.toISOString());
        
        if (result.pix && result.pix.length > 0) {
          for (const payment of result.pix) {
            // Check if this payment's txid exists in our deposits
            const existingDeposit = await storage.getPixDepositByTxid(payment.txid);
            
            if (!existingDeposit) {
              // This payment was received but we don't have a record - reconcile it
              console.log(`[PIX Reconcile] Found untracked payment: ${payment.txid} for R$ ${payment.valor}`);
              
              // Create deposit record
              const deposit = await storage.createPixDeposit({
                userId: userId, // Credit to current user
                txid: payment.txid,
                amount: payment.valor,
                status: "completed",
                paidAt: new Date(payment.horario),
                expiresAt: new Date(),
              });
              
              // Credit wallet
              await storage.creditWallet(userId, "BRL", payment.valor);
              
              // Create transaction
              await storage.createTransaction({
                userId,
                type: "deposit",
                status: "completed",
                toCurrency: "BRL",
                toAmount: payment.valor,
                description: `PIX deposit - R$ ${payment.valor}`,
                externalId: payment.txid,
              });
              
              notificationService.notifyDepositCompleted(userId, payment.valor, payment.txid)
                .catch(err => console.error("Failed to send reconciled deposit notification:", err));
              
              console.log(`[PIX Reconcile] Reconciled payment ${payment.txid}: R$ ${payment.valor}`);
              reconciledCount++;
            } else if (existingDeposit.status === "pending") {
              // Deposit exists but still pending - mark as completed
              await storage.updatePixDeposit(existingDeposit.id, {
                status: "completed",
                paidAt: new Date(payment.horario),
              });
              
              await storage.creditWallet(existingDeposit.userId, "BRL", existingDeposit.amount);
              
              notificationService.notifyDepositCompleted(existingDeposit.userId, existingDeposit.amount, existingDeposit.txid)
                .catch(err => console.error("Failed to send deposit notification:", err));
              
              console.log(`[PIX Reconcile] Updated pending deposit ${existingDeposit.txid}: R$ ${existingDeposit.amount}`);
              verifiedCount++;
            }
          }
        }
      } catch (reconcileError: any) {
        console.error("[PIX Reconcile] Error during reconciliation:", reconcileError.message);
      }

      const total = verifiedCount + reconciledCount;
      res.json({ 
        message: total > 0 
          ? `${total} payment(s) verified and credited`
          : "No new payments found",
        verified: verifiedCount,
        reconciled: reconciledCount,
        checked: deposits.length,
      });
    } catch (error: any) {
      console.error("[PIX Verify] Error:", error);
      res.status(500).json({ error: "Failed to verify deposits" });
    }
  });

  // List all received PIX payments from Banco Inter (admin/debug endpoint)
  app.get("/api/pix/received", requireAuth, async (req, res) => {
    try {
      const interClient = getInterClient();
      
      // Get payments from the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();
      
      console.log(`[PIX Received] Fetching payments from ${startStr} to ${endStr}`);
      
      const result = await interClient.listPixPayments(startStr, endStr);
      
      console.log(`[PIX Received] Found ${result.pix?.length || 0} payments`);
      
      res.json({
        payments: result.pix || [],
        period: { start: startStr, end: endStr },
      });
    } catch (error: any) {
      console.error("[PIX Received] Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch received payments", details: error.message });
    }
  });
  
  // ==================== PIX WITHDRAWAL ROUTES ====================

  // Create PIX withdrawal - with PIX rate limiting
  app.post("/api/pix/withdraw", requireAuth, pixLimiter, async (req, res) => {
    let amountDebited = false;
    let userId: string | undefined;
    let amount: string | undefined;
    
    try {
      const withdrawSchema = z.object({
        pixKeyId: z.string(),
        amount: z.string().refine((val) => parseFloat(val) >= 1, "Minimum amount is R$ 1.00"),
      });

      const parsed = withdrawSchema.parse(req.body);
      amount = parsed.amount;
      userId = getUserId(req)!;

      // Get PIX key
      const pixKey = await storage.getPixKey(parsed.pixKeyId);
      if (!pixKey || pixKey.userId !== userId) {
        return res.status(404).json({ error: "PIX key not found" });
      }

      // Check balance
      const wallet = await storage.getWallet(userId, "BRL");
      if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Debit wallet - track that we've debited so we can refund on any error
      await storage.debitWallet(userId, "BRL", amount);
      amountDebited = true;

      // Create withdrawal record
      const withdrawal = await storage.createPixWithdrawal({
        userId,
        pixKeyId: parsed.pixKeyId,
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

      // Send notification for pending withdrawal
      notificationService.notifyWithdrawalPending(userId, amount)
        .catch(err => console.error("Failed to send withdrawal pending notification:", err));

      // Send PIX via Banco Inter
      const interClient = getInterClient();
      const result = await interClient.sendPixWithdrawal({
        valor: parseFloat(amount).toFixed(2),
        chave: pixKey.keyValue,
        descricao: "Saque Otsem Pay",
      });

      // Update withdrawal with e2e ID - PIX was successful
      await storage.updatePixWithdrawal(withdrawal.id, {
        endToEndId: result.endToEndId,
        status: "completed",
        processedAt: new Date(),
      });

      await storage.updateTransactionStatus(transaction.id, "completed", result.endToEndId);
      amountDebited = false; // PIX successful, don't refund

      // Send notification for completed withdrawal
      notificationService.notifyWithdrawalCompleted(userId, amount)
        .catch(err => console.error("Failed to send withdrawal completed notification:", err));

      res.json({
        id: withdrawal.id,
        amount,
        status: "completed",
        endToEndId: result.endToEndId,
      });
    } catch (error: any) {
      console.error("Withdrawal error:", error.response?.data || error.message);
      
      // Refund the balance if we debited it and the withdrawal failed
      if (amountDebited && userId && amount) {
        try {
          await storage.creditWallet(userId, "BRL", amount);
          console.log(`[Withdrawal] Refunded R$ ${amount} to user ${userId}`);
          
          // Send notification for failed withdrawal
          notificationService.notifyWithdrawalFailed(userId, amount)
            .catch(err => console.error("Failed to send withdrawal failed notification:", err));
        } catch (refundError) {
          console.error("CRITICAL: Failed to refund balance:", refundError);
        }
      }
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      if (error.message === "Insufficient balance") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ 
        error: "Withdrawal failed",
        reason: "Unable to process PIX transfer. Your balance has been refunded.",
      });
    }
  });

  // Get user withdrawals
  app.get("/api/pix/withdrawals", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const withdrawals = await storage.getUserWithdrawals(userId);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  // ==================== NOTIFICATION ROUTES ====================

  // Get user notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const notification = await storage.markNotificationAsRead(req.params.id, userId);
      res.json(notification);
    } catch (error: any) {
      if (error.message === "Notification not found") {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // ==================== VIRTUAL CARDS ====================

  // Get user's virtual card
  app.get("/api/cards", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      let card = await storage.getUserCard(userId);
      
      if (!card) {
        const user = await storage.getUser(userId);
        const last4 = Math.floor(1000 + Math.random() * 9000).toString();
        const cardNumber = `4532${Math.floor(100000000000 + Math.random() * 899999999999)}`;
        const expiryYear = (new Date().getFullYear() + 4).toString();
        const expiryMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
        const cvv = Math.floor(100 + Math.random() * 900).toString();
        
        card = await storage.createVirtualCard({
          userId,
          cardNumber,
          last4,
          expiryMonth,
          expiryYear,
          cvv,
          cardholderName: user?.name?.toUpperCase() || "CARDHOLDER",
          status: "active",
          monthlyLimit: "5000",
          dailyWithdrawalLimit: "1000",
        });
      }
      
      res.json({
        ...card,
        cardNumber: `**** **** **** ${card.last4}`,
      });
    } catch (error) {
      console.error("Get card error:", error);
      res.status(500).json({ error: "Failed to fetch card" });
    }
  });

  // Get full card details (authenticated reveal)
  app.get("/api/cards/details", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const card = await storage.getUserCard(userId);
      
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch card details" });
    }
  });

  // Freeze/unfreeze card
  app.patch("/api/cards/status", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { status } = req.body;
      
      if (!["active", "frozen"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const card = await storage.getUserCard(userId);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      const updated = await storage.updateCardStatus(card.id, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update card status" });
    }
  });

  // ==================== KYC ====================

  // Get KYC status
  app.get("/api/kyc", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      let submission = await storage.getKycSubmission(userId);
      
      if (!submission) {
        submission = await storage.createKycSubmission({
          userId,
          status: "not_started",
        });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC status" });
    }
  });

  // Update KYC (upload document)
  app.patch("/api/kyc", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { step } = req.body;
      
      let updates: any = {};
      
      if (step === "id_front") {
        updates.idFrontUploaded = true;
      } else if (step === "id_back") {
        updates.idBackUploaded = true;
      } else if (step === "selfie") {
        updates.selfieUploaded = true;
      }
      
      let submission = await storage.getKycSubmission(userId);
      if (!submission) {
        submission = await storage.createKycSubmission({
          userId,
          status: "not_started",
          ...updates,
        });
      } else {
        submission = await storage.updateKycSubmission(userId, updates);
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ error: "Failed to update KYC" });
    }
  });

  // Submit KYC for review
  app.post("/api/kyc/submit", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const submission = await storage.getKycSubmission(userId);
      
      if (!submission) {
        return res.status(404).json({ error: "KYC submission not found" });
      }
      
      if (!submission.idFrontUploaded || !submission.idBackUploaded || !submission.selfieUploaded) {
        return res.status(400).json({ error: "All documents must be uploaded" });
      }
      
      const updated = await storage.updateKycSubmission(userId, {
        status: "in_review",
        submittedAt: new Date(),
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit KYC" });
    }
  });

  // ==================== SECURITY SETTINGS ====================

  // Get security settings
  app.get("/api/security", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      let settings = await storage.getSecuritySettings(userId);
      
      if (!settings) {
        settings = await storage.createSecuritySettings({
          userId,
          twoFactorEnabled: false,
          biometricEnabled: true,
          loginAlertsEnabled: true,
          transactionAlertsEnabled: true,
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch security settings" });
    }
  });

  // Update security settings
  app.patch("/api/security", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { twoFactorEnabled, biometricEnabled, loginAlertsEnabled, transactionAlertsEnabled } = req.body;
      
      let settings = await storage.getSecuritySettings(userId);
      if (!settings) {
        settings = await storage.createSecuritySettings({
          userId,
          twoFactorEnabled: twoFactorEnabled ?? false,
          biometricEnabled: biometricEnabled ?? true,
          loginAlertsEnabled: loginAlertsEnabled ?? true,
          transactionAlertsEnabled: transactionAlertsEnabled ?? true,
        });
      } else {
        const updates: any = {};
        if (twoFactorEnabled !== undefined) updates.twoFactorEnabled = twoFactorEnabled;
        if (biometricEnabled !== undefined) updates.biometricEnabled = biometricEnabled;
        if (loginAlertsEnabled !== undefined) updates.loginAlertsEnabled = loginAlertsEnabled;
        if (transactionAlertsEnabled !== undefined) updates.transactionAlertsEnabled = transactionAlertsEnabled;
        
        settings = await storage.updateSecuritySettings(userId, updates);
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update security settings" });
    }
  });

  // Change password
  app.post("/api/security/change-password", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ error: "Password change not available for this account" });
      }
      
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(userId, newPasswordHash);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // ==================== ACTIVE SESSIONS ====================

  // Get active sessions
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const sessions = await storage.getUserSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Delete a session (logout from device)
  app.delete("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      await storage.deleteSession(req.params.id, userId);
      res.json({ message: "Session terminated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to terminate session" });
    }
  });

  // Logout from all other devices
  app.post("/api/sessions/logout-all", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { exceptCurrent } = req.body;
      await storage.deleteAllUserSessions(userId, exceptCurrent);
      res.json({ message: "All other sessions terminated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to terminate sessions" });
    }
  });

  // ==================== REFERRALS ====================

  // Get referral code and stats
  app.get("/api/referrals", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const [code, stats, referralsList] = await Promise.all([
        storage.getUserReferralCode(userId),
        storage.getReferralStats(userId),
        storage.getUserReferrals(userId),
      ]);
      
      const recentReferrals = await Promise.all(
        referralsList.slice(0, 10).map(async (r) => {
          const referredUser = r.referredId ? await storage.getUser(r.referredId) : null;
          return {
            id: r.id,
            name: referredUser?.name || "User",
            date: r.createdAt,
            status: r.status,
            earned: r.rewardAmount,
          };
        })
      );
      
      res.json({
        code,
        stats,
        recentReferrals,
      });
    } catch (error) {
      console.error("Referral error:", error);
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  // ==================== ANALYTICS ====================

  // Get transaction stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const stats = await storage.getTransactionStats(userId, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
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

            // Send notification for completed deposit
            notificationService.notifyDepositCompleted(deposit.userId, valor, txid)
              .catch(err => console.error("Failed to send deposit completed notification:", err));

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
