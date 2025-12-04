import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, Transaction } from "@/lib/api";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  deposit: {
    icon: ArrowDownLeft,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "text-foreground/80",
    bg: "bg-white/[0.06]",
    border: "border-white/10",
  },
  exchange: {
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  transfer: {
    icon: Wallet,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
};

export default function Activity() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", 100],
    queryFn: () => getTransactions(100),
  });

  const groupTransactions = (txs: Transaction[]) => {
    const today: Transaction[] = [];
    const yesterday: Transaction[] = [];
    const thisWeek: Transaction[] = [];
    const older: Transaction[] = [];

    txs.forEach((tx) => {
      const date = new Date(tx.createdAt);
      if (isToday(date)) {
        today.push(tx);
      } else if (isYesterday(date)) {
        yesterday.push(tx);
      } else if (isThisWeek(date)) {
        thisWeek.push(tx);
      } else {
        older.push(tx);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const grouped = transactions ? groupTransactions(transactions) : { today: [], yesterday: [], thisWeek: [], older: [] };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-display font-bold tracking-tight">
          {isPortuguese ? "Atividade" : "Activity"}
        </h1>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input 
              type="text" 
              placeholder={isPortuguese ? "Buscar transações..." : "Search transactions..."} 
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 font-medium"
            />
          </div>
          <button className="bg-white/[0.03] border border-white/[0.06] rounded-xl w-12 h-12 flex items-center justify-center hover:bg-white/[0.08] transition-all">
            <Filter className="w-4 h-4 text-muted-foreground/60" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.06]" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/[0.06] rounded" />
                    <div className="h-3 w-20 bg-white/[0.04] rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-white/[0.06] rounded" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground">
              {isPortuguese ? "Nenhuma transação ainda" : "No transactions yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.today.length > 0 && (
              <TransactionGroup 
                title={isPortuguese ? "Hoje" : "Today"} 
                transactions={grouped.today} 
                setLocation={setLocation}
                isPortuguese={isPortuguese}
              />
            )}
            {grouped.yesterday.length > 0 && (
              <TransactionGroup 
                title={isPortuguese ? "Ontem" : "Yesterday"} 
                transactions={grouped.yesterday} 
                setLocation={setLocation}
                isPortuguese={isPortuguese}
              />
            )}
            {grouped.thisWeek.length > 0 && (
              <TransactionGroup 
                title={isPortuguese ? "Esta Semana" : "This Week"} 
                transactions={grouped.thisWeek} 
                setLocation={setLocation}
                isPortuguese={isPortuguese}
              />
            )}
            {grouped.older.length > 0 && (
              <TransactionGroup 
                title={isPortuguese ? "Anteriores" : "Older"} 
                transactions={grouped.older} 
                setLocation={setLocation}
                isPortuguese={isPortuguese}
              />
            )}
          </div>
        )}
      </div>

      <BottomNav active="activity" />
    </div>
  );
}

function TransactionGroup({ 
  title, 
  transactions, 
  setLocation,
  isPortuguese
}: { 
  title: string; 
  transactions: Transaction[]; 
  setLocation: (path: string) => void;
  isPortuguese: boolean;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3 pl-1">{title}</h3>
      <div className="space-y-2">
        {transactions.map((tx, index) => (
          <TransactionItem 
            key={tx.id} 
            tx={tx} 
            index={index} 
            onClick={() => setLocation(`/transaction/${tx.id}`)}
            isPortuguese={isPortuguese}
          />
        ))}
      </div>
    </div>
  );
}

function TransactionItem({ 
  tx, 
  index, 
  onClick,
  isPortuguese
}: { 
  tx: Transaction; 
  index: number; 
  onClick: () => void;
  isPortuguese: boolean;
}) {
  const config = typeConfig[tx.type] || typeConfig.transfer;
  const Icon = config.icon;

  const getTypeLabel = (type: string) => {
    if (isPortuguese) {
      switch (type) {
        case "deposit": return "Depósito";
        case "withdrawal": return "Saque";
        case "exchange": return "Troca";
        case "transfer": return "Transferência";
        default: return type;
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getStatusLabel = (status: string) => {
    if (isPortuguese) {
      switch (status) {
        case "completed": return "Concluído";
        case "pending": return "Pendente";
        case "processing": return "Processando";
        case "failed": return "Falhou";
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatAmount = () => {
    if (tx.type === "deposit" && tx.toAmount) {
      return `+${tx.toAmount} ${tx.toCurrency}`;
    } else if (tx.type === "withdrawal" && tx.fromAmount) {
      return `-${tx.fromAmount} ${tx.fromCurrency}`;
    } else if (tx.type === "exchange" && tx.toAmount) {
      return `+${tx.toAmount} ${tx.toCurrency}`;
    }
    return tx.description || "-";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group border border-transparent hover:border-white/[0.06]"
      onClick={onClick}
      data-testid={`activity-transaction-${tx.id}`}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 border",
          config.bg, config.color, config.border
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
            {getTypeLabel(tx.type)}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground/60 font-medium">
              {format(new Date(tx.createdAt), "HH:mm")}
            </span>
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded-md border font-semibold uppercase tracking-wider",
              tx.status === "completed" 
                ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10" 
                : tx.status === "failed"
                ? "border-red-500/20 text-red-400 bg-red-500/10"
                : "border-yellow-500/20 text-yellow-400 bg-yellow-500/10"
            )}>
              {getStatusLabel(tx.status)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn(
          "font-semibold text-sm", 
          formatAmount().startsWith("+") ? "text-emerald-400" : "text-foreground"
        )}>
          {formatAmount()}
        </div>
      </div>
    </motion.div>
  );
}
