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
    color: "text-white",
    bg: "bg-white/10",
  },
  {
    id: 2,
    type: "received",
    title: "Pix from Maria",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    amount: "+R$ 450,00",
    icon: ArrowDownLeft,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    id: 3,
    type: "exchange",
    title: "BRL to USDT",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    amount: "+240.50 USDT",
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: 4,
    type: "purchase",
    title: "Netflix",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    amount: "-R$ 55,90",
    icon: CreditCard,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
];

export function TransactionHistory() {
  return (
    <div className="space-y-2 pb-20">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">View all</button>
      </div>

      <div className="space-y-1">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.1 }}
            className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                tx.bg, tx.color
              )}>
                <tx.icon className="w-4 h-4" />
              </div>
              
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white">{tx.title}</h4>
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
