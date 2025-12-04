import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { Notification } from "@shared/schema";

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
}

class NotificationWebSocket {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient[]> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: "/ws/notifications"
    });

    this.wss.on("connection", (ws, req) => {
      console.log("[WebSocket] New connection attempt");
      
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === "auth" && data.userId) {
            this.registerClient(ws, data.userId);
            ws.send(JSON.stringify({ type: "connected", message: "Connected to notifications" }));
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        this.removeClient(ws);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket] Connection error:", error);
        this.removeClient(ws);
      });
    });

    console.log("[WebSocket] Notification server initialized");
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
