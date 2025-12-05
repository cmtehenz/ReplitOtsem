import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Notification } from "@shared/schema";
import crypto from "crypto";

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
}

interface WsToken {
  userId: string;
  expires: number;
}

class NotificationWebSocket {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient[]> = new Map();
  private tokens: Map<string, WsToken> = new Map();
  private userTokens: Map<string, Set<string>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: "/ws/notifications"
    });

    this.wss.on("connection", (ws, req) => {
      if (!this.validateOrigin(req)) {
        ws.close(4003, "Invalid origin");
        return;
      }

      const token = this.extractToken(req);
      
      if (!token) {
        ws.close(4001, "Authentication required");
        return;
      }

      const tokenData = this.tokens.get(token);
      if (!tokenData || tokenData.expires < Date.now()) {
        this.tokens.delete(token);
        ws.close(4002, "Invalid or expired token");
        return;
      }

      this.tokens.delete(token);
      const userTokenSet = this.userTokens.get(tokenData.userId);
      if (userTokenSet) {
        userTokenSet.delete(token);
      }
      
      this.registerClient(ws, tokenData.userId);
      ws.send(JSON.stringify({ type: "connected", message: "Connected to notifications" }));

      ws.on("close", () => {
        this.removeClient(ws);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket] Connection error:", error);
        this.removeClient(ws);
      });

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
          }
        } catch {
        }
      });
    });

    console.log("[WebSocket] Notification server initialized");
  }

  private validateOrigin(req: IncomingMessage): boolean {
    const origin = req.headers.origin || req.headers.referer;
    if (!origin) {
      return true;
    }
    
    try {
      const originUrl = new URL(origin);
      const hostHeader = req.headers.host || "";
      
      if (originUrl.host === hostHeader) {
        return true;
      }
      
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  private extractToken(req: IncomingMessage): string | null {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      return url.searchParams.get("token");
    } catch {
      return null;
    }
  }

  createToken(userId: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 30000;
    
    this.tokens.set(token, { userId, expires });
    
    let userTokenSet = this.userTokens.get(userId);
    if (!userTokenSet) {
      userTokenSet = new Set();
      this.userTokens.set(userId, userTokenSet);
    }
    userTokenSet.add(token);
    
    setTimeout(() => {
      this.tokens.delete(token);
      const set = this.userTokens.get(userId);
      if (set) {
        set.delete(token);
      }
    }, 35000);
    
    return token;
  }

  invalidateUserTokens(userId: string): void {
    const userTokenSet = this.userTokens.get(userId);
    if (userTokenSet) {
      for (const token of userTokenSet) {
        this.tokens.delete(token);
      }
      this.userTokens.delete(userId);
    }
  }

  disconnectUser(userId: string): void {
    this.invalidateUserTokens(userId);
    
    const clients = this.clients.get(userId);
    if (clients) {
      for (const client of clients) {
        client.ws.close(4004, "Session ended");
      }
      this.clients.delete(userId);
    }
  }

  private registerClient(ws: WebSocket, userId: string) {
    const client: ConnectedClient = { ws, userId };
    
    const existingClients = this.clients.get(userId) || [];
    existingClients.push(client);
    this.clients.set(userId, existingClients);
    
    console.log(`[WebSocket] Client registered for user ${userId}. Total connections: ${existingClients.length}`);
  }

  private removeClient(ws: WebSocket) {
    const entries = Array.from(this.clients.entries());
    for (const [userId, clients] of entries) {
      const filtered = clients.filter((c: ConnectedClient) => c.ws !== ws);
      if (filtered.length !== clients.length) {
        if (filtered.length === 0) {
          this.clients.delete(userId);
        } else {
          this.clients.set(userId, filtered);
        }
        console.log(`[WebSocket] Client removed for user ${userId}`);
        break;
      }
    }
  }

  sendNotification(userId: string, notification: Notification) {
    const clients = this.clients.get(userId);
    if (!clients || clients.length === 0) {
      console.log(`[WebSocket] No connected clients for user ${userId}`);
      return;
    }

    const message = JSON.stringify({
      type: "notification",
      data: notification
    });

    let sentCount = 0;
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
        sentCount++;
      }
    }
    
    console.log(`[WebSocket] Sent notification to ${sentCount}/${clients.length} clients for user ${userId}`);
  }

  broadcastToUser(userId: string, type: string, data: any) {
    const clients = this.clients.get(userId);
    if (!clients) return;

    const message = JSON.stringify({ type, data });
    
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  }

  getConnectedUserCount(): number {
    return this.clients.size;
  }

  isUserConnected(userId: string): boolean {
    const clients = this.clients.get(userId);
    return clients !== undefined && clients.some(c => c.ws.readyState === WebSocket.OPEN);
  }
}

export const notificationWS = new NotificationWebSocket();
