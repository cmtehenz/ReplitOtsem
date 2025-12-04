import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Menu, ArrowLeftRight, Coffee, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLocation } from "wouter";

const transactions = [
  {
    id: 1,
    type: "sent",
    title: "Pix Sent to João Silva",
    date: new Date(),
    amount: "-R$ 150,00",
    status: "Completed",
    icon: ArrowUpRight,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    id: 2,
    type: "received",
    title: "Pix Received from Maria",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    amount: "+R$ 450,00",
    status: "Completed",
    icon: ArrowDownLeft,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: 3,
    type: "exchange",
    title: "BRL to USDT",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    amount: "+240.50 USDT",
    subAmount: "-R$ 1.250,00",
    status: "Completed",
    icon: ArrowLeftRight,
    color: "text-white",
    bg: "bg-white/10",
  },
  {
    id: 4,
    type: "purchase",
    title: "Starbucks Coffee",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    amount: "-R$ 24,90",
    status: "Completed",
    icon: Coffee,
    color: "text-white",
    bg: "bg-white/10",
  },
  {
    id: 5,
    type: "purchase",
    title: "Amazon Purchase",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    amount: "-R$ 1.299,00",
    status: "Pending",
    icon: ShoppingBag,
    color: "text-white",
    bg: "bg-white/10",
  },
  {
    id: 6,
    type: "received",
    title: "USDT Deposit",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    amount: "+500.00 USDT",
    status: "Completed",
    icon: ArrowDownLeft,
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
  },
];

export default function Activity() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-display font-bold">Activity</h1>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full bg-card border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="bg-card border border-white/5 rounded-xl w-12 flex items-center justify-center hover:bg-white/5 transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Date Groups */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Today</h3>
            <div className="space-y-4">
              {transactions.slice(0, 3).map((tx, index) => (
                <TransactionItem key={tx.id} tx={tx} index={index} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Yesterday</h3>
            <div className="space-y-4">
              {transactions.slice(3, 4).map((tx, index) => (
                <TransactionItem key={tx.id} tx={tx} index={index} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">This Week</h3>
            <div className="space-y-4">
              {transactions.slice(4).map((tx, index) => (
                <TransactionItem key={tx.id} tx={tx} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="activity" />
    </div>
  );
}

function TransactionItem({ tx, index }: { tx: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
          tx.bg, tx.color
        )}>
          <tx.icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{tx.title}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{format(tx.date, "HH:mm")}</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-md border",
              tx.status === "Completed" ? "border-green-500/20 text-green-500" : "border-yellow-500/20 text-yellow-500"
            )}>
              {tx.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn("font-medium text-sm", 
          tx.amount.startsWith("+") ? "text-primary" : "text-white"
        )}>
          {tx.amount}
        </div>
        {tx.subAmount && (
          <div className="text-xs text-muted-foreground">{tx.subAmount}</div>
        )}
      </div>
    </motion.div>
  );
}

// Reusing Bottom Nav for now
function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <NavButton icon={Menu} label="Home" active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={Menu} label="Wallet" active={active === "wallet"} onClick={() => setLocation("/wallet")} />
        <div 
          className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(50,188,173,0.4)] border-4 border-background cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setLocation("/")}
        >
          <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
        </div>
        <NavButton icon={Menu} label="Activity" active={active === "activity"} onClick={() => setLocation("/activity")} />
        <NavButton icon={Menu} label="Profile" active={active === "profile"} onClick={() => setLocation("/profile")} />
      </div>
    </nav>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-16 py-1 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-white"
      )}
    >
      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
        <div className={cn("w-3 h-3 rounded-sm", active ? "bg-primary" : "bg-muted-foreground")} />
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
