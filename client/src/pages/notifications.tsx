import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Bell, Calendar, Wallet, TrendingUp, Check } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const notifications = [
  {
    id: 1,
    title: "Deposit Confirmed",
    message: "Your deposit of R$ 450,00 via Pix has been confirmed.",
    time: "2 min ago",
    read: false,
    icon: Wallet,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20"
  },
  {
    id: 2,
    title: "Price Alert",
    message: "Bitcoin is up 5% in the last 24 hours!",
    time: "1 hour ago",
    read: false,
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    id: 3,
    title: "Weekly Report",
    message: "Your weekly trading summary is ready to view.",
    time: "Yesterday",
    read: true,
    icon: Calendar,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    id: 4,
    title: "Security Alert",
    message: "New login detected from São Paulo, BR.",
    time: "2 days ago",
    read: true,
    icon: Bell,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
];

export default function Notifications() {
  const [, setLocation] = useLocation();

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">Notifications</h1>
          <button className="text-xs text-primary font-medium hover:text-primary/80 transition-colors uppercase tracking-wider">
            Mark all read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group active:scale-[0.98]",
                item.read 
                  ? "bg-card/40 border-white/5 hover:bg-card/60" 
                  : "bg-card/80 border-primary/30 hover:bg-card shadow-[0_0_20px_rgba(139,92,246,0.05)]"
              )}
            >
              {!item.read && (
                <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-pulse" />
              )}
              
              <div className="flex gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                  item.bg, item.color, item.border
                )}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className={cn("font-bold text-base font-display", !item.read ? "text-white" : "text-muted-foreground")}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-white/80 transition-colors">
                    {item.message}
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-medium pt-1 flex items-center gap-1">
                    {item.time}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="pt-12 text-center pb-8">
            <div className="w-16 h-1 bg-white/10 rounded-full mx-auto mb-4" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">No more notifications</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
