import { ArrowLeft, Bell, ArrowUpRight, ArrowDownLeft, RefreshCw, Shield, CheckCheck, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
    noMoreNotifications: "End of notifications",
    loading: "Loading...",
  },
  "pt-BR": {
    notifications: "Notificações",
    markAllRead: "Marcar todas como lidas",
    noNotifications: "Nenhuma notificação ainda",
    noMoreNotifications: "Fim das notificações",
    loading: "Carregando...",
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
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      };
    case "deposit_pending":
    case "withdrawal_pending":
      return {
        color: "text-amber-600",
        bg: "bg-amber-50",
      };
    case "deposit_failed":
    case "withdrawal_failed":
    case "exchange_failed":
      return {
        color: "text-red-600",
        bg: "bg-red-50",
      };
    case "security_alert":
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    default:
      return {
        color: "text-primary",
        bg: "bg-primary/10",
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
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {t.notifications}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            data-testid="button-mark-all-read"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="text-xs text-primary font-medium hover:text-primary/80 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const style = getNotificationStyle(notification.type);

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-item-${notification.id}`}
                  className={cn(
                    "relative bg-white rounded-2xl p-4 card-shadow cursor-pointer transition-all hover:shadow-md",
                    !notification.isRead && "ring-1 ring-primary/20"
                  )}
                >
                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <div className="flex gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      style.bg,
                      style.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium text-sm truncate",
                        !notification.isRead ? "text-gray-900" : "text-gray-600"
                      )}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 pt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-8 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                {t.noMoreNotifications}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
