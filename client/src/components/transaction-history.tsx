import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  deposit: {
    icon: ArrowDownLeft,
    color: "text-emerald-400",
    bg: "bg-emerald-500/12",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "text-foreground/80",
    bg: "bg-white/[0.06]",
  },
  exchange: {
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-500/12",
  },
  transfer: {
    icon: Wallet,
    color: "text-purple-400",
    bg: "bg-purple-500/12",
  },
};

export function TransactionHistory() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">{isPortuguese ? "Atividade Recente" : "Recent Activity"}</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/[0.06]" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/[0.06] rounded" />
                  <div className="h-3 w-20 bg-white/[0.04] rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-white/[0.06] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">{isPortuguese ? "Atividade Recente" : "Recent Activity"}</h3>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground/60 text-sm">
            {isPortuguese ? "Nenhuma transação ainda" : "No transactions yet"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between px-1">
        <h3 className="section-title">{isPortuguese ? "Atividade Recente" : "Recent Activity"}</h3>
        <button 
          className="text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors tracking-wide"
          onClick={() => setLocation("/activity")}
          data-testid="button-view-all-transactions"
        >
          {isPortuguese ? "Ver tudo" : "View all"}
        </button>
      </div>

      <div className="space-y-2">
        {transactions?.map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;
          
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
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-transparent hover:border-white/[0.06] transition-all duration-200 cursor-pointer group"
              onClick={() => setLocation(`/transaction/${tx.id}`)}
              data-testid={`transaction-row-${tx.id}`}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.06]",
                  config.bg, config.color
                )}>
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">{tx.description}</h4>
                  <span className="text-[11px] text-muted-foreground/60 font-medium block">
                    {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className={cn(
                  "font-semibold text-sm tracking-wide", 
                  displayAmount.startsWith("+") ? "text-emerald-400" : "text-foreground"
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
