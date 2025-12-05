import { storage } from "./storage";
import { notificationWS } from "./websocket";
import type { InsertNotification, Notification } from "@shared/schema";

type NotificationType = InsertNotification["type"];

interface NotificationData {
  amount?: string;
  currency?: string;
  txid?: string;
  fromCurrency?: string;
  toCurrency?: string;
  fromAmount?: string;
  toAmount?: string;
}

class NotificationService {
  async createAndSend(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: NotificationData
  ): Promise<Notification> {
    const notification = await storage.createNotification({
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : undefined,
    });

    notificationWS.sendNotification(userId, notification);
    
    return notification;
  }

  async notifyDepositPending(userId: string, amount: string, txid: string) {
    return this.createAndSend(
      userId,
      "deposit_pending",
      "Deposit Created",
      `PIX deposit of R$ ${parseFloat(amount).toFixed(2)} is waiting for payment`,
      { amount, currency: "BRL", txid }
    );
  }

  async notifyDepositCompleted(userId: string, amount: string, txid: string) {
    return this.createAndSend(
      userId,
      "deposit_completed",
      "Deposit Completed",
      `R$ ${parseFloat(amount).toFixed(2)} has been added to your wallet`,
      { amount, currency: "BRL", txid }
    );
  }

  async notifyDepositFailed(userId: string, amount: string, txid: string) {
    return this.createAndSend(
      userId,
      "deposit_failed",
      "Deposit Failed",
      `Your PIX deposit of R$ ${parseFloat(amount).toFixed(2)} has expired or failed`,
      { amount, currency: "BRL", txid }
    );
  }

  async notifyWithdrawalPending(userId: string, amount: string) {
    return this.createAndSend(
      userId,
      "withdrawal_pending",
      "Withdrawal Processing",
      `PIX withdrawal of R$ ${parseFloat(amount).toFixed(2)} is being processed`,
      { amount, currency: "BRL" }
    );
  }

  async notifyWithdrawalCompleted(userId: string, amount: string) {
    return this.createAndSend(
      userId,
      "withdrawal_completed",
      "Withdrawal Completed",
      `R$ ${parseFloat(amount).toFixed(2)} has been sent to your PIX key`,
      { amount, currency: "BRL" }
    );
  }

  async notifyWithdrawalFailed(userId: string, amount: string, reason?: string) {
    return this.createAndSend(
      userId,
      "withdrawal_failed",
      "Withdrawal Failed",
      reason || `Your PIX withdrawal of R$ ${parseFloat(amount).toFixed(2)} could not be processed`,
      { amount, currency: "BRL" }
    );
  }

  async notifyExchangeCompleted(
    userId: string,
    fromCurrency: string,
    toCurrency: string,
    fromAmount: string,
    toAmount: string
  ) {
    const fromFormatted = fromCurrency === "BRL" 
      ? `R$ ${parseFloat(fromAmount).toFixed(2)}` 
      : `${parseFloat(fromAmount).toFixed(2)} ${fromCurrency}`;
    const toFormatted = toCurrency === "BRL"
      ? `R$ ${parseFloat(toAmount).toFixed(2)}`
      : `${parseFloat(toAmount).toFixed(2)} ${toCurrency}`;

    return this.createAndSend(
      userId,
      "exchange_completed",
      "Exchange Completed",
      `Successfully exchanged ${fromFormatted} to ${toFormatted}`,
      { fromCurrency, toCurrency, fromAmount, toAmount }
    );
  }

  async notifyExchangeFailed(userId: string, fromCurrency: string, toCurrency: string, fromAmount: string) {
    return this.createAndSend(
      userId,
      "exchange_failed",
      "Exchange Failed",
      `Your exchange of ${parseFloat(fromAmount).toFixed(2)} ${fromCurrency} to ${toCurrency} could not be completed`,
      { fromCurrency, toCurrency, fromAmount }
    );
  }

  async notifyPixTransferSent(userId: string, amount: number, recipient: string) {
    return this.createAndSend(
      userId,
      "transfer_sent",
      "PIX Transfer Sent",
      `R$ ${amount.toFixed(2)} was sent via PIX to ${recipient}`,
      { amount: amount.toString(), recipient, currency: "BRL" }
    );
  }

  async notifySecurityAlert(userId: string, message: string) {
    return this.createAndSend(
      userId,
      "security_alert",
      "Security Alert",
      message
    );
  }

  async notifySystem(userId: string, title: string, message: string) {
    return this.createAndSend(userId, "system", title, message);
  }
}

export const notificationService = new NotificationService();
