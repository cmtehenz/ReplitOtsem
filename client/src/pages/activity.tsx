import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, ArrowLeftRight, Coffee, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BottomNav } from "@/components/bottom-nav";

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
    border: "border-red-500/20"
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
    border: "border-primary/20"
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
    border: "border-white/20"
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
    border: "border-white/20"
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
    border: "border-white/20"
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
    border: "border-[#26A17B]/20"
  },
];

export default function Activity() {
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-display font-bold tracking-tight">Activity</h1>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full bg-card/50 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-base focus:outline-none focus:border-primary/50 focus:bg-card/70 transition-all placeholder:text-muted-foreground/50 backdrop-blur-sm font-medium"
            />
          </div>
          <button className="bg-card/50 border border-white/10 rounded-2xl w-16 h-14 flex items-center justify-center hover:bg-white/10 transition-all hover:border-primary/30 backdrop-blur-sm shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10">
            <Filter className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Date Groups */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">Today</h3>
            <div className="space-y-3">
              {transactions.slice(0, 3).map((tx, index) => (
                <TransactionItem key={tx.id} tx={tx} index={index} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">Yesterday</h3>
            <div className="space-y-3">
              {transactions.slice(3, 4).map((tx, index) => (
                <TransactionItem key={tx.id} tx={tx} index={index} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">This Week</h3>
            <div className="space-y-3">
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
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/5"
      onClick={() => window.location.href = "/transaction/1"}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border duration-300",
          tx.bg, tx.color, tx.border
        )}>
          <tx.icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{tx.title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground font-medium">{format(tx.date, "HH:mm")}</span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider",
              tx.status === "Completed" ? "border-green-500/20 text-green-500 bg-green-500/5" : "border-yellow-500/20 text-yellow-500 bg-yellow-500/5"
            )}>
              {tx.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn("font-bold text-sm tracking-wide", 
          tx.amount.startsWith("+") ? "text-primary" : "text-white"
        )}>
          {tx.amount}
        </div>
        {tx.subAmount && (
          <div className="text-xs text-muted-foreground mt-0.5 font-medium">{tx.subAmount}</div>
        )}
      </div>
    </motion.div>
  );
}
