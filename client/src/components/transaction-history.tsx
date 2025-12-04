import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag, RefreshCw, Wallet, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const transactions = [
  {
    id: 1,
    type: "sent",
    title: "Pix to João Silva",
    date: new Date(),
    amount: "-R$ 150,00",
    icon: ArrowUpRight,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20"
  },
  {
    id: 2,
    type: "received",
    title: "Pix from Maria",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    amount: "+R$ 450,00",
    icon: ArrowDownLeft,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    id: 3,
    type: "exchange",
    title: "Exchanged BRL to USDT",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    amount: "+240.50 USDT",
    icon: RefreshCw,
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
    border: "border-[#26A17B]/20"
  },
  {
    id: 4,
    type: "purchase",
    title: "Netflix Subscription",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    amount: "-R$ 55,90",
    icon: CreditCard,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    id: 5,
    type: "purchase",
    title: "Spotify",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    amount: "-R$ 21,90",
    icon: CreditCard,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20"
  },
  {
    id: 6,
    type: "received",
    title: "USDT Deposit",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    amount: "+500.00 USDT",
    icon: Wallet,
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
    border: "border-[#26A17B]/20"
  },
];

export function TransactionHistory() {
  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-display font-medium tracking-tight">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">View all</button>
      </div>

      <div className="space-y-0">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-300",
                tx.bg, tx.color, tx.border
              )}>
                <tx.icon className="w-5 h-5" />
              </div>
              
              <div className="space-y-0.5">
                <h4 className="font-medium text-sm text-white group-hover:text-primary transition-colors">{tx.title}</h4>
                <span className="text-xs text-muted-foreground block">{format(tx.date, "MMM d, HH:mm")}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className={cn(
                "font-bold text-sm tracking-wide", 
                tx.amount.startsWith("+") ? "text-green-400" : "text-white"
              )}>
                {tx.amount}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
