import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get user wallets
  app.get("/api/wallets", async (req, res) => {
    try {
      // For demo purposes, using a fixed user ID
      // In production, this would come from session/auth
      const userId = req.query.userId as string || "demo-user";
      
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // Get user transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = req.query.userId as string || "demo-user";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Execute exchange
  app.post("/api/exchange", async (req, res) => {
    try {
      const { userId = "demo-user", fromCurrency, toCurrency, fromAmount, toAmount } = req.body;
      
      // Validate input
      const exchangeSchema = z.object({
        fromCurrency: z.enum(["BRL", "USDT", "BTC"]),
        toCurrency: z.enum(["BRL", "USDT", "BTC"]),
        fromAmount: z.string(),
        toAmount: z.string(),
      });

      const validatedData = exchangeSchema.parse({
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
      });

      const transaction = await storage.executeExchange(
        userId,
        validatedData.fromCurrency,
        validatedData.toCurrency,
        validatedData.fromAmount,
        validatedData.toAmount
      );

      res.json(transaction);
    } catch (error: any) {
      if (error.message === "Insufficient balance") {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to execute exchange" });
      }
    }
  });

  // Create demo user and seed data
  app.post("/api/init-demo", async (req, res) => {
    try {
      // Check if demo user exists
      let user = await storage.getUserByUsername("demo");
      
      if (!user) {
        // Create demo user
        user = await storage.createUser({
          username: "demo",
          password: "demo123", // In production, this would be hashed
          name: "Alex Morgan",
          email: "alex.morgan@example.com",
        });

        // Add some sample transactions
        await storage.createTransaction({
          userId: user.id,
          type: "deposit",
          status: "completed",
          fromCurrency: null,
          toCurrency: "BRL",
          fromAmount: null,
          toAmount: "450.00",
          description: "Pix from Maria",
        });

        await storage.createTransaction({
          userId: user.id,
          type: "withdrawal",
          status: "completed",
          fromCurrency: "BRL",
          toCurrency: null,
          fromAmount: "150.00",
          toAmount: null,
          description: "Pix to João Silva",
        });

        await storage.createTransaction({
          userId: user.id,
          type: "exchange",
          status: "completed",
          fromCurrency: "BRL",
          toCurrency: "USDT",
          fromAmount: "1237.50",
          toAmount: "240.50",
          description: "Exchanged BRL to USDT",
        });
      }

      res.json({ userId: user.id, message: "Demo user initialized" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize demo user" });
    }
  });

  return httpServer;
}
