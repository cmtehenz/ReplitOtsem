import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Bell, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Shield, CheckCheck, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getWebSocketToken, type Notification } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useEffect, useRef, useCallback } from "react";

const translations: Record<"en" | "pt-BR", Record<string, string>> = {
  en: {
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet",
    noMoreNotifications: "No more notifications",
    loading: "Loading...",
    depositCompleted: "Deposit Completed",
    depositPending: "Deposit Pending",
    depositFailed: "Deposit Failed",
    withdrawalCompleted: "Withdrawal Completed",
    withdrawalPending: "Withdrawal Processing",
    withdrawalFailed: "Withdrawal Failed",
    exchangeCompleted: "Exchange Completed",
    exchangeFailed: "Exchange Failed",
    securityAlert: "Security Alert",
    system: "System",
  },
  "pt-BR": {
    notifications: "Notificações",
    markAllRead: "Marcar todas como lidas",
    noNotifications: "Nenhuma notificação ainda",
    noMoreNotifications: "Não há mais notificações",
    loading: "Carregando...",
    depositCompleted: "Depósito Concluído",
    depositPending: "Depósito Pendente",
    depositFailed: "Depósito Falhou",
    withdrawalCompleted: "Saque Concluído",
    withdrawalPending: "Saque em Processamento",
    withdrawalFailed: "Saque Falhou",
    exchangeCompleted: "Troca Concluída",
    exchangeFailed: "Troca Falhou",
    securityAlert: "Alerta de Segurança",
    system: "Sistema",
  },
};

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "deposit_completed":
    case "deposit_pending":
    case "deposit_failed":
      return ArrowDownLeft;
    case "withdrawal_completed":
    case "withdrawal_pending":
    case "withdrawal_failed":
      return ArrowUpRight;
    case "exchange_completed":
    case "exchange_failed":
      return RefreshCw;
    case "security_alert":
      return Shield;
    default:
      return Bell;
  }
}

function getNotificationStyle(type: Notification["type"]) {
  switch (type) {
    case "deposit_completed":
    case "withdrawal_completed":
    case "exchange_completed":
      return {
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
      };
    case "deposit_pending":
    case "withdrawal_pending":
      return {
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    case "deposit_failed":
    case "withdrawal_failed":
    case "exchange_failed":
      return {
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };
    case "security_alert":
      return {
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
      };
    default:
      return {
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
      };
  }
}

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(50),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  }, [markReadMutation]);

  const connectWebSocket = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { token } = await getWebSocketToken();
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications?token=${token}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "notification") {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = () => {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };
    } catch (err) {
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 10000);
    }
  }, [queryClient, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connectWebSocket, user?.id]);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: language === "pt-BR" ? ptBR : enUS,
      });
    } catch {
      return "";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {t.notifications}
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <button
            data-testid="button-mark-all-read"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="text-xs text-primary font-medium hover:text-primary/80 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">{t.markAllRead}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const style = getNotificationStyle(notification.type);

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    data-testid={`notification-item-${notification.id}`}
                    className={cn(
                      "relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group active:scale-[0.98]",
                      notification.isRead
                        ? "bg-card/40 border-white/5 hover:bg-card/60"
                        : "bg-card/80 border-primary/30 hover:bg-card shadow-[0_0_20px_rgba(139,92,246,0.05)]"
                    )}
                  >
                    {!notification.isRead && (
                      <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-pulse" />
                    )}

                    <div className="flex gap-5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                          style.bg,
                          style.color,
                          style.border
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-bold text-base font-display truncate",
                            !notification.isRead ? "text-white" : "text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-white/80 transition-colors">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/50 font-medium pt-1 flex items-center gap-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="pt-12 text-center pb-8">
              <div className="w-16 h-1 bg-white/10 rounded-full mx-auto mb-4" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {t.noMoreNotifications}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
