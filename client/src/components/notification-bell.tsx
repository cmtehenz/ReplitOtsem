import { Bell } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUnreadNotificationCount, getWebSocketToken } from "@/lib/api";
import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousCountRef = useRef<number>(0);
  const { user } = useAuth();

  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 15000,
  });

  const unreadCount = unreadData?.count || 0;

  useEffect(() => {
    if (unreadCount > previousCountRef.current) {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
    previousCountRef.current = unreadCount;
  }, [unreadCount, queryClient]);

  const connect = useCallback(async () => {
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
            queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = () => {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };
    } catch (err) {
      reconnectTimeoutRef.current = setTimeout(connect, 10000);
    }
  }, [queryClient, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect, user?.id]);

  return (
    <button
      className={cn(
        "w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 border border-white/[0.06] hover:border-white/[0.12] relative group",
        className
      )}
      onClick={() => setLocation("/notifications")}
      data-testid="button-notifications"
    >
      <Bell className="w-[18px] h-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-[0_0_8px_rgba(139,92,246,0.5)]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
