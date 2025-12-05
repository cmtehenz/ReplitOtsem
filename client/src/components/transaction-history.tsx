import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  deposit: {
    icon: ArrowDownLeft,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "text-white",
    bg: "bg-white/10",
  },
  exchange: {
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  transfer: {
    icon: Wallet,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
};

export function TransactionHistory() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2 pb-20">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-20">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">View all</button>
      </div>

      <div className="space-y-1">
        {transactions?.map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;
          
          // Format amount based on transaction type
          let displayAmount = "";
          if (tx.type === "deposit" && tx.toAmount) {
            displayAmount = `+${tx.toAmount} ${tx.toCurrency}`;
          } else if (tx.type === "withdrawal" && tx.fromAmount) {
            displayAmount = `-${tx.fromAmount} ${tx.fromCurrency}`;
          } else if (tx.type === "exchange" && tx.toAmount) {
            displayAmount = `+${tx.toAmount} ${tx.toCurrency}`;
          }

          return (
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
                  config.bg, config.color
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-white">{tx.description}</h4>
                  <span className="text-xs text-muted-foreground block">
                    {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className={cn(
                  "font-bold text-sm tracking-wide", 
                  displayAmount.startsWith("+") ? "text-green-400" : "text-white"
                )}>
                  {displayAmount}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
