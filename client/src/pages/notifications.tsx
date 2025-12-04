import { motion } from "framer-motion";
import { ArrowLeft, Bell, Calendar, Check, Wallet, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

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
  },
  {
    id: 3,
    title: "Weekly Report",
    message: "Your weekly trading summary is ready.",
    time: "Yesterday",
    read: true,
    icon: Calendar,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: 4,
    title: "Login Attempt",
    message: "New login detected from São Paulo, BR.",
    time: "2 days ago",
    read: true,
    icon: Bell,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

export default function Notifications() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => setLocation("/")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center pr-4">
          <h1 className="font-display font-bold text-lg">Notifications</h1>
        </div>
        <button className="text-xs text-primary font-medium hover:underline">
          Mark all read
        </button>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-4">
        {notifications.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "relative p-4 rounded-2xl border transition-all hover:bg-card/80 cursor-pointer",
              item.read ? "bg-card/30 border-white/5" : "bg-card border-primary/20"
            )}
          >
            {!item.read && (
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(50,188,173,0.5)]" />
            )}
            
            <div className="flex gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                item.bg, item.color
              )}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1 pr-4">
                <div className="flex justify-between items-start">
                  <h3 className={cn("font-medium text-sm", !item.read && "text-white")}>{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                <p className="text-[10px] text-muted-foreground/60 pt-1">{item.time}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="pt-8 text-center">
          <p className="text-xs text-muted-foreground">No more notifications</p>
        </div>
      </div>
    </div>
  );
}
