import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, ArrowLeftRight, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  deposit: {
    icon: ArrowDownLeft,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  exchange: {
    icon: ArrowLeftRight,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  transfer: {
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
};

export default function Activity() {
  const { t } = useLanguage();
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(50),
  });

  const groupTransactionsByDate = (txs: any[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string; transactions: any[] }[] = [
      { label: t("activity.today") || "Today", transactions: [] },
      { label: t("activity.yesterday") || "Yesterday", transactions: [] },
      { label: t("activity.thisWeek") || "This Week", transactions: [] },
      { label: t("activity.earlier") || "Earlier", transactions: [] },
    ];

    txs.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate.toDateString() === today.toDateString()) {
        groups[0].transactions.push(tx);
      } else if (txDate.toDateString() === yesterday.toDateString()) {
        groups[1].transactions.push(tx);
      } else if (txDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groups[2].transactions.push(tx);
      } else {
        groups[3].transactions.push(tx);
      }
    });

    return groups.filter((g) => g.transactions.length > 0);
  };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-display font-bold tracking-tight">
          {t("activity.title") || "Activity"}
        </h1>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("activity.search") || "Search transactions..."} 
              className="w-full bg-card/50 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-base focus:outline-none focus:border-primary/50 focus:bg-card/70 transition-all placeholder:text-muted-foreground/50 backdrop-blur-sm font-medium"
              data-testid="input-search-transactions"
            />
          </div>
          <button 
            className="bg-card/50 border border-white/10 rounded-2xl w-16 h-14 flex items-center justify-center hover:bg-white/10 transition-all hover:border-primary/30 backdrop-blur-sm shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10"
            data-testid="button-filter"
          >
            <Filter className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {t("activity.empty") || "No transactions yet"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {t("activity.emptyDesc") || "Your transactions will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupTransactionsByDate(transactions).map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                  {group.label}
                </h3>
                <div className="space-y-3">
                  {group.transactions.map((tx, index) => (
                    <TransactionItem key={tx.id} tx={tx} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="activity" />
    </div>
  );
}

function TransactionItem({ tx, index }: { tx: any; index: number }) {
  const config = typeConfig[tx.type] || typeConfig.transfer;
  const Icon = config.icon;

  let displayAmount = "";
  if (tx.type === "deposit" && tx.toAmount) {
    displayAmount = `+${parseFloat(tx.toAmount).toFixed(2)} ${tx.toCurrency}`;
  } else if (tx.type === "withdrawal" && tx.fromAmount) {
    displayAmount = `-${parseFloat(tx.fromAmount).toFixed(2)} ${tx.fromCurrency}`;
  } else if (tx.type === "exchange") {
    if (tx.toAmount) {
      displayAmount = `+${parseFloat(tx.toAmount).toFixed(2)} ${tx.toCurrency}`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/5"
      data-testid={`transaction-item-${tx.id}`}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border duration-300",
          config.bg, config.color, config.border
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
            {tx.description}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground font-medium">
              {format(new Date(tx.createdAt), "HH:mm")}
            </span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider",
              tx.status === "completed" 
                ? "border-green-500/20 text-green-500 bg-green-500/5" 
                : tx.status === "pending"
                ? "border-yellow-500/20 text-yellow-500 bg-yellow-500/5"
                : "border-red-500/20 text-red-500 bg-red-500/5"
            )}>
              {tx.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn("font-bold text-sm tracking-wide", 
          displayAmount.startsWith("+") ? "text-green-400" : "text-white"
        )}>
          {displayAmount}
        </div>
        {tx.type === "exchange" && tx.fromAmount && (
          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
            -{parseFloat(tx.fromAmount).toFixed(2)} {tx.fromCurrency}
          </div>
        )}
      </div>
    </motion.div>
  );
}
