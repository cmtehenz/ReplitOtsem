import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const transactions = [
  {
    id: 1,
    type: "sent",
    title: "Pix Sent to João Silva",
    date: new Date(),
    amount: "-R$ 150,00",
    icon: ArrowUpRight,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    id: 2,
    type: "received",
    title: "Pix Received from Maria",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    amount: "+R$ 450,00",
    icon: ArrowDownLeft,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: 3,
    type: "purchase",
    title: "Starbucks Coffee",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    amount: "-R$ 24,90",
    icon: Coffee,
    color: "text-white",
    bg: "bg-white/10",
  },
  {
    id: 4,
    type: "purchase",
    title: "Amazon Purchase",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    amount: "-R$ 1.299,00",
    icon: ShoppingBag,
    color: "text-white",
    bg: "bg-white/10",
  },
];

export function TransactionHistory() {
  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-display font-medium">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>

      <div className="relative border-l border-white/10 ml-4 space-y-6">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="relative pl-8 group cursor-pointer"
          >
            <div className={cn(
              "absolute -left-[1.1rem] top-0 w-9 h-9 rounded-full border-4 border-background flex items-center justify-center transition-transform group-hover:scale-110",
              tx.bg, tx.color
            )}>
              <tx.icon className="w-4 h-4" />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{tx.title}</h4>
                <span className="text-xs text-muted-foreground">{format(tx.date, "MMM d, HH:mm")}</span>
              </div>
              <span className={cn("font-medium text-sm", tx.amount.startsWith("+") ? "text-primary" : "text-white")}>
                {tx.amount}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
