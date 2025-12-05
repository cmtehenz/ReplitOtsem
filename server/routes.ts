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
        referralCode: z.string().optional(), // Anonymous referral code
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

      // Validate referral code if provided
      let referralCodeRecord = null;
      if (data.referralCode) {
        referralCodeRecord = await storage.getReferralCodeByCode(data.referralCode);
        // Silently ignore invalid codes - don't expose whether code exists
      }

      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        cpf: data.cpf,
      });

      // Create referral record if valid code was used (anonymously)
      if (referralCodeRecord) {
        try {
          await storage.createReferral(
            referralCodeRecord.userId, // The referrer
            user.id, // The new user
            referralCodeRecord.id
          );
        } catch (err) {
          // Silently fail - don't block registration
          console.error("Failed to create referral record:", err);
        }
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
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      // Return more specific error message
      res.status(500).json({ error: error.message || "Failed to register user" });
    }
  });

  // Login (with stricter rate limiting)
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string(),
        twoFactorCode: z.string().optional(),
      });

      const { username, password, twoFactorCode } = loginSchema.parse(req.body);

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

      // Check if 2FA is enabled
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        // If no 2FA code provided, return challenge
        if (!twoFactorCode) {
          return res.status(200).json({
            requiresTwoFactor: true,
            userId: user.id,
            message: "Two-factor authentication required",
          });
        }

        // Verify the 2FA code
        const { TOTP, Secret } = await import("otpauth");
        const secret = Secret.fromBase32(user.twoFactorSecret);
        const totp = new TOTP({
          issuer: "OtsemPay",
          label: user.email,
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: secret,
        });

        const delta = totp.validate({ token: twoFactorCode, window: 1 });
        
        // If TOTP code invalid, try backup codes
        if (delta === null) {
          const isBackupValid = await storage.validateBackupCode(user, twoFactorCode);
          if (!isBackupValid) {
            return res.status(401).json({ error: "Invalid verification code" });
          }
        }
      }

      // Set session
      req.session.userId = user.id;

      // Track login session
      try {
        const userAgent = req.get("User-Agent") || null;
        const ipAddress = req.ip || req.socket.remoteAddress || null;
        
        await storage.createLoginSession({
          userId: user.id,
          deviceInfo: userAgent,
          ipAddress,
          location: null, // Could be enriched with IP geolocation service
          sessionId: req.sessionID,
          isCurrent: true,
        });
        
        // Mark this session as current
        await storage.markSessionAsCurrent(req.sessionID, user.id);
      } catch (sessionErr) {
        console.error("Failed to track login session:", sessionErr);
        // Don't fail login if session tracking fails
      }

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

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    const userId = req.session.userId;
    
    if (userId) {
      notificationWS.disconnectUser(userId);
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Logout all sessions
  app.post("/api/auth/logout-all", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Disconnect WebSocket
      notificationWS.disconnectUser(userId);
      
      // Delete all sessions for this user from the database
      await pool.query("DELETE FROM session WHERE sess->>'userId' = $1", [userId]);
      
      // Send security notification
      await notificationService.notifySecurityAlert(userId, "All sessions have been signed out from your account.");
      
      res.json({ message: "All sessions logged out successfully" });
    } catch (error) {
      console.error("Logout all error:", error);
      res.status(500).json({ error: "Failed to logout all sessions" });
    }
  });

  // Forgot password - request reset link
  app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
      const forgotSchema = z.object({
        email: z.string().email(),
      });

      const { email } = forgotSchema.parse(req.body);

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      // In production, you would send an actual email here
      if (user) {
        // Generate reset token (in production, save this and send via email)
        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log(`Password reset requested for ${email}. Token: ${resetToken}`);
        
        // In a real implementation:
        // 1. Save the reset token with expiration to database
        // 2. Send email with reset link containing the token
        // For now, we just log it and return success
      }
      
      res.json({ 
        message: "If an account with that email exists, we've sent password reset instructions.",
        success: true 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to process request" });
    }
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
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        verified: user.verified,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
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
        if (existingUser && existingUser.id !== req.session.userId) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      const user = await storage.updateUser(req.session.userId!, data);

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
      const token = notificationWS.createToken(req.session.userId!);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: "Failed to create WebSocket token" });
    }
  });

  // ==================== SECURITY ROUTES ====================

  // Change password
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const changePasswordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).regex(/\d/, "Password must contain at least one number"),
      });

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await storage.validatePassword(user, currentPassword);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Update password
      await storage.updatePassword(user.id, newPassword);

      // Create security notification
      await notificationService.notifySecurityAlert(user.id, "Your password was successfully changed.");

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Setup 2FA - Generate secret and backup codes
  app.post("/api/auth/2fa/setup", requireAuth, async (req, res) => {
    try {
      const { TOTP, Secret } = await import("otpauth");
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is already enabled" });
      }

      // Generate a new secret
      const secret = new Secret({ size: 20 });
      
      // Create TOTP instance
      const totp = new TOTP({
        issuer: "OtsemPay",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Generate backup codes
      const backupCodes: string[] = [];
      for (let i = 0; i < 6; i++) {
        const code = crypto.randomBytes(6).toString("hex").toUpperCase();
        backupCodes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`);
      }

      // Store secret and hashed backup codes (but don't enable 2FA yet)
      await storage.setup2FA(user.id, secret.base32, backupCodes);

      res.json({
        secret: secret.base32,
        otpAuthUrl: totp.toString(),
        backupCodes: backupCodes,
      });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  });

  // Verify 2FA code and enable
  app.post("/api/auth/2fa/verify", requireAuth, async (req, res) => {
    try {
      const { TOTP, Secret } = await import("otpauth");
      
      const verifySchema = z.object({
        code: z.string().length(6),
      });

      const { code } = verifySchema.parse(req.body);

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.twoFactorSecret) {
        return res.status(400).json({ error: "2FA not set up. Please run setup first." });
      }

      // Verify the TOTP code
      const secret = Secret.fromBase32(user.twoFactorSecret);
      const totp = new TOTP({
        issuer: "OtsemPay",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) {
        return res.status(401).json({ error: "Invalid verification code" });
      }

      // Enable 2FA
      await storage.enable2FA(user.id);

      // Create security notification
      await notificationService.notifySecurityAlert(user.id, "Two-factor authentication has been enabled on your account.");

      res.json({ success: true, message: "2FA enabled successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to verify 2FA" });
    }
  });

  // Disable 2FA
  app.post("/api/auth/2fa/disable", requireAuth, async (req, res) => {
    try {
      const disableSchema = z.object({
        password: z.string().min(1),
      });

      const { password } = disableSchema.parse(req.body);

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password before disabling 2FA
      const isValid = await storage.validatePassword(user, password);
      if (!isValid) {
        return res.status(401).json({ error: "Password is incorrect" });
      }

      // Disable 2FA
      await storage.disable2FA(user.id);

      // Create security notification
      await notificationService.notifySecurityAlert(user.id, "Two-factor authentication has been disabled on your account.");

      res.json({ success: true, message: "2FA disabled successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  // Get 2FA status
  app.get("/api/auth/2fa/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        enabled: user.twoFactorEnabled || false,
        hasSecret: !!user.twoFactorSecret,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get 2FA status" });
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

  // Get KYC status and limits
  app.get("/api/kyc/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const kycLevel = user.kycLevel || "none";
      const monthlyVolume = await storage.getMonthlyTransactionVolume(req.session.userId!);
      
      let limit = 0;
      let remaining = 0;
      
      if (kycLevel === "basic") {
        limit = 50000;
        remaining = Math.max(0, limit - monthlyVolume);
      } else if (kycLevel === "full") {
        limit = -1; // Unlimited
        remaining = -1;
      }

      res.json({
        kycLevel,
        kycVerifiedAt: user.kycVerifiedAt,
        monthlyLimit: limit,
        monthlyUsed: monthlyVolume,
        monthlyRemaining: remaining,
        isUnlimited: kycLevel === "full",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get KYC status" });
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

      // Calculate amount in BRL for limit checking
      let amountBRL = amount;
      if (data.fromCurrency === "USDT") {
        amountBRL = amount * rate;
      }

      // Check KYC limits
      const kycCheck = await storage.checkKycLimit(req.session.userId!, amountBRL);
      if (!kycCheck.allowed) {
        if (kycCheck.kycLevel === "none") {
          return res.status(403).json({ 
            error: "KYC verification required to make exchanges",
            kycLevel: kycCheck.kycLevel,
            requiresKyc: true
          });
        }
        return res.status(403).json({ 
          error: `Monthly limit exceeded. Remaining: R$ ${kycCheck.remaining.toFixed(2)}. Upgrade to Full KYC for unlimited transactions.`,
          kycLevel: kycCheck.kycLevel,
          remaining: kycCheck.remaining,
          limit: kycCheck.limit
        });
      }

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

      const transaction = await storage.executeExchange(
        req.session.userId!,
        data.fromCurrency,
        data.toCurrency,
        amount.toString(),
        toAmount.toFixed(data.toCurrency === "BRL" ? 2 : 6)
      );

      // Send notification for successful exchange
      notificationService.notifyExchangeCompleted(
        req.session.userId!,
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
      const amountNum = parseFloat(amount);

      // Check KYC limits
      const kycCheck = await storage.checkKycLimit(userId, amountNum);
      if (!kycCheck.allowed) {
        if (kycCheck.kycLevel === "none") {
          return res.status(403).json({ 
            error: "KYC verification required to make withdrawals",
            kycLevel: kycCheck.kycLevel,
            requiresKyc: true
          });
        }
        return res.status(403).json({ 
          error: `Monthly limit exceeded. Remaining: R$ ${kycCheck.remaining.toFixed(2)}. Upgrade to Full KYC for unlimited transactions.`,
          kycLevel: kycCheck.kycLevel,
          remaining: kycCheck.remaining,
          limit: kycCheck.limit
        });
      }

      // Get PIX key
      const pixKey = await storage.getPixKey(pixKeyId);
      if (!pixKey || pixKey.userId !== userId) {
        return res.status(404).json({ error: "PIX key not found" });
      }

      // Check balance
      const wallet = await storage.getWallet(userId, "BRL");
      if (!wallet || parseFloat(wallet.balance) < amountNum) {
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

      // Send notification for pending withdrawal
      notificationService.notifyWithdrawalPending(userId, amount)
        .catch(err => console.error("Failed to send withdrawal pending notification:", err));

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

        // Send notification for completed withdrawal
        notificationService.notifyWithdrawalCompleted(userId, amount)
          .catch(err => console.error("Failed to send withdrawal completed notification:", err));

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

        // Send notification for failed withdrawal
        notificationService.notifyWithdrawalFailed(userId, amount)
          .catch(err => console.error("Failed to send withdrawal failed notification:", err));

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

  // Send PIX to external key (not registered)
  app.post("/api/pix/send-external", requireAuth, pixLimiter, async (req, res) => {
    try {
      const sendSchema = z.object({
        keyType: z.enum(["cpf", "email", "phone", "random"]),
        keyValue: z.string().min(1),
        amount: z.string().refine((val) => parseFloat(val) >= 1, "Minimum amount is R$ 1.00"),
        recipientName: z.string().optional(),
      });

      const { keyType, keyValue, amount, recipientName } = sendSchema.parse(req.body);
      const userId = req.session.userId!;
      const amountNum = parseFloat(amount);

      // Check balance
      const wallet = await storage.getWallet(userId, "BRL");
      if (!wallet || parseFloat(wallet.balance) < amountNum) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Debit the wallet first
      await storage.debitWallet(userId, "BRL", amount);

      // Create a transaction record
      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        status: "processing",
        fromCurrency: "BRL",
        toCurrency: null,
        fromAmount: amount,
        toAmount: null,
        description: `PIX transfer to ${keyType.toUpperCase()}: ${keyValue}`,
        externalId: null,
      });

      try {
        // Call Inter API to process the PIX
        const { InterAPI } = await import("./inter-api");
        const interApi = new InterAPI();

        const result = await interApi.initiatePixPayment({
          keyType,
          keyValue,
          amount: amountNum,
          description: `PIX transfer from Otsem Pay`,
        });

        // Update transaction as completed
        await storage.updateTransactionStatus(transaction.id, "completed");

        // Send notification for successful transfer
        notificationService.notifyPixTransferSent(userId, amountNum, keyValue)
          .catch(err => console.error("Failed to send transfer notification:", err));

        res.json({
          success: true,
          transactionId: transaction.id,
          endToEndId: result.endToEndId,
          message: "PIX sent successfully",
        });
      } catch (apiError: any) {
        console.error("Inter API external send error:", apiError.response?.data || apiError.message);

        // Mark as failed and refund
        await storage.updateTransactionStatus(transaction.id, "failed");
        await storage.creditWallet(userId, "BRL", amount);

        res.status(500).json({
          error: "Transfer failed",
          reason: "Unable to process PIX transfer. Your balance has been refunded.",
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to process transfer" });
    }
  });

  // ==================== NOTIFICATION ROUTES ====================

  // Get user notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getUserNotifications(req.session.userId!, limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id, req.session.userId!);
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
      await storage.markAllNotificationsAsRead(req.session.userId!);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // ==================== LOGIN HISTORY ====================

  // Get login history for current user
  app.get("/api/auth/login-history", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserLoginSessions(req.session.userId!, 10);
      
      // Mark current session
      const currentSessionId = req.sessionID;
      const sessionsWithCurrent = sessions.map(session => ({
        ...session,
        isCurrent: session.sessionId === currentSessionId
      }));
      
      res.json(sessionsWithCurrent);
    } catch (error) {
      console.error("Failed to get login history:", error);
      res.status(500).json({ error: "Failed to get login history" });
    }
  });

  // ==================== KYC ROUTES ====================

  // Submit KYC document
  app.post("/api/kyc/submit", requireAuth, async (req, res) => {
    try {
      const kycSchema = z.object({
        documentType: z.string(),
        documentData: z.string(), // Base64 encoded image
      });

      const { documentType, documentData } = kycSchema.parse(req.body);

      const doc = await storage.createKycDocument({
        userId: req.session.userId!,
        documentType,
        documentUrl: documentData, // Store base64 for now
        status: "pending"
      });

      res.json({ id: doc.id, status: doc.status });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("KYC submit error:", error);
      res.status(500).json({ error: "Failed to submit KYC document" });
    }
  });

  // Complete KYC verification (auto-approve for now)
  app.post("/api/kyc/complete", requireAuth, async (req, res) => {
    try {
      const docs = await storage.getUserKycDocuments(req.session.userId!);
      
      // Check if user has submitted required documents
      const hasSelfie = docs.some(d => d.documentType === "selfie");
      const hasId = docs.some(d => d.documentType === "id_front" || d.documentType === "id_back");
      
      let newKycLevel = "none";
      if (hasSelfie && hasId) {
        newKycLevel = "full";
      } else if (hasSelfie || hasId) {
        newKycLevel = "basic";
      }

      if (newKycLevel !== "none") {
        await storage.updateUserKycLevel(req.session.userId!, newKycLevel);
      }

      res.json({ success: true, kycLevel: newKycLevel });
    } catch (error) {
      console.error("KYC complete error:", error);
      res.status(500).json({ error: "Failed to complete KYC verification" });
    }
  });

  // ==================== NEWS API ====================

  // Get crypto news (aggregated from CoinGecko and other sources)
  app.get("/api/news", async (req, res) => {
    try {
      const lang = (req.query.lang as string) || "en";
      
      // Fetch real news from CoinGecko's free API
      const cryptoNewsPromise = fetch("https://api.coingecko.com/api/v3/news")
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);
      
      // Fetch market data for trend info
      const marketDataPromise = fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether&price_change_percentage=24h")
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);

      const [newsData, marketData] = await Promise.all([cryptoNewsPromise, marketDataPromise]);

      // Create a map of price changes
      const priceChanges: Record<string, number> = {};
      if (Array.isArray(marketData)) {
        for (const coin of marketData) {
          priceChanges[coin.id] = coin.price_change_percentage_24h || 0;
        }
      }

      // Transform news to our format
      let news: any[] = [];
      
      if (Array.isArray(newsData?.data)) {
        news = newsData.data.slice(0, 10).map((item: any, index: number) => {
          // Determine category based on keywords
          let category: "breaking" | "market" | "general" = "general";
          const title = (item.title || "").toLowerCase();
          const description = (item.description || "").toLowerCase();
          
          if (title.includes("breaking") || title.includes("just in") || title.includes("urgent")) {
            category = "breaking";
          } else if (title.includes("price") || title.includes("market") || title.includes("trading") || 
                     title.includes("bull") || title.includes("bear") || title.includes("%")) {
            category = "market";
          }

          // Calculate trend based on mentioned coins
          let trend = 0;
          if (title.includes("bitcoin") || description.includes("bitcoin")) {
            trend = priceChanges["bitcoin"] || 0;
          } else if (title.includes("ethereum") || description.includes("ethereum")) {
            trend = priceChanges["ethereum"] || 0;
          }

          return {
            id: item.id || `news-${index}`,
            title: item.title || "",
            description: item.description || "",
            category,
            timestamp: item.updated_at ? new Date(item.updated_at * 1000).toISOString() : new Date().toISOString(),
            trend: Math.abs(trend) > 0.5 ? parseFloat(trend.toFixed(1)) : 0,
            source: item.author || "CoinGecko",
            url: item.url || ""
          };
        });
      }

      // If no news fetched, use fallback data
      if (news.length === 0) {
        news = [
          {
            id: "1",
            title: lang === "pt" ? "Bitcoin atinge nova alta de 30 dias" : "Bitcoin Hits 30-Day High",
            description: lang === "pt" 
              ? "O Bitcoin subiu nas últimas 24 horas, atingindo níveis não vistos em um mês."
              : "Bitcoin has surged in the last 24 hours, reaching levels not seen in a month.",
            category: "breaking" as const,
            timestamp: new Date().toISOString(),
            trend: priceChanges["bitcoin"] || 2.5,
            source: "CoinDesk"
          },
          {
            id: "2",
            title: lang === "pt" ? "Stablecoins ganham tração no mercado brasileiro" : "Stablecoins Gain Traction in Brazilian Market",
            description: lang === "pt"
              ? "USDT e outras stablecoins veem aumento no volume de negociação no Brasil."
              : "USDT and other stablecoins see increase in trading volume in Brazil.",
            category: "market" as const,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            trend: 0,
            source: "CryptoNews"
          },
          {
            id: "3",
            title: lang === "pt" ? "Banco Central do Brasil avança em regulamentação cripto" : "Brazil Central Bank Advances Crypto Regulation",
            description: lang === "pt"
              ? "Novas regras prometem trazer mais segurança e clareza para investidores de criptomoedas."
              : "New rules promise to bring more security and clarity for cryptocurrency investors.",
            category: "general" as const,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            trend: 0,
            source: "Reuters"
          },
          {
            id: "4",
            title: lang === "pt" ? "Ethereum completa atualização de rede" : "Ethereum Completes Network Upgrade",
            description: lang === "pt"
              ? "A mais recente atualização do Ethereum promete transações mais rápidas e taxas mais baixas."
              : "The latest Ethereum upgrade promises faster transactions and lower fees.",
            category: "breaking" as const,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            trend: priceChanges["ethereum"] || 1.5,
            source: "The Block"
          },
          {
            id: "5",
            title: lang === "pt" ? "Análise: Por que o PIX é ideal para cripto" : "Analysis: Why PIX is Ideal for Crypto",
            description: lang === "pt"
              ? "O sistema de pagamentos instantâneos do Brasil se mostra perfeito para transações de criptomoedas."
              : "Brazil's instant payment system proves perfect for cryptocurrency transactions.",
            category: "general" as const,
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            trend: 0,
            source: "Otsem Blog"
          }
        ];
      }

      res.json(news);
    } catch (error) {
      console.error("News fetch error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // ==================== TRANSACTION STATS ====================

  // Get transaction statistics
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getTransactionStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      console.error("Stats fetch error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ==================== REFERRAL ROUTES ====================

  // Get or create user's referral code
  app.get("/api/referral/code", requireAuth, async (req, res) => {
    try {
      const code = await storage.createReferralCode(req.session.userId!);
      res.json({ code: code.code });
    } catch (error) {
      res.status(500).json({ error: "Failed to get referral code" });
    }
  });

  // Get referral stats for current user
  app.get("/api/referral/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getReferralStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get referral stats" });
    }
  });

  // Validate a referral code (for UI validation during signup)
  app.post("/api/referral/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.json({ valid: false });
      }
      const codeRecord = await storage.getReferralCodeByCode(code);
      // Only return whether valid - don't expose any info about the referrer
      res.json({ valid: !!codeRecord });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate code" });
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

  // ==================== CRYPTO ADDRESSES ====================

  // Get user's crypto addresses
  app.get("/api/crypto/addresses", requireAuth, async (req, res) => {
    try {
      const addresses = await storage.getUserCryptoAddresses(req.session.userId!);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get addresses" });
    }
  });

  // Get or create address for specific currency/network
  app.post("/api/crypto/address", requireAuth, async (req, res) => {
    try {
      const { currency, network } = req.body;
      if (!currency || !network) {
        return res.status(400).json({ error: "Currency and network required" });
      }
      const address = await storage.getOrCreateCryptoAddress(req.session.userId!, currency, network);
      res.json(address);
    } catch (error) {
      res.status(500).json({ error: "Failed to get/create address" });
    }
  });

  // ==================== REFERRAL REWARDS ====================

  // Get user's referral rewards
  app.get("/api/referral/rewards", requireAuth, async (req, res) => {
    try {
      const rewards = await storage.getUserReferralRewards(req.session.userId!);
      const totals = await storage.getReferralRewardsTotal(req.session.userId!);
      res.json({ rewards, ...totals });
    } catch (error) {
      res.status(500).json({ error: "Failed to get rewards" });
    }
  });

  // ==================== EMAIL VERIFICATION ====================

  // Request email verification
  app.post("/api/auth/verify-email/request", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.verified) {
        return res.status(400).json({ error: "Email already verified" });
      }
      
      const verification = await storage.createEmailVerification(user.id, user.email);
      
      // In production, send email here
      // For now, return the token (for testing)
      console.log(`Email verification token for ${user.email}: ${verification.token}`);
      
      res.json({ message: "Verification email sent", token: verification.token });
    } catch (error) {
      res.status(500).json({ error: "Failed to send verification email" });
    }
  });

  // Verify email with token
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token required" });
      }
      
      const verification = await storage.getEmailVerification(token);
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      if (verification.verifiedAt) {
        return res.status(400).json({ error: "Email already verified" });
      }
      if (new Date() > verification.expiresAt) {
        return res.status(400).json({ error: "Token expired" });
      }
      
      await storage.markEmailVerified(token);
      await storage.updateUserEmailVerified(verification.userId);
      
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  // ==================== PASSWORD RESET ====================

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If email exists, reset link will be sent" });
      }
      
      const reset = await storage.createPasswordReset(user.id);
      
      // In production, send email here
      console.log(`Password reset token for ${email}: ${reset.token}`);
      
      res.json({ message: "If email exists, reset link will be sent", token: reset.token });
    } catch (error) {
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      const reset = await storage.getPasswordReset(token);
      if (!reset) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      if (reset.usedAt) {
        return res.status(400).json({ error: "Token already used" });
      }
      
      await storage.resetUserPassword(reset.userId, newPassword);
      await storage.markPasswordResetUsed(token);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  return httpServer;
}
