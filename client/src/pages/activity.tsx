import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet, Search, Filter } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, Transaction } from "@/lib/api";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  deposit: {
    icon: ArrowDownLeft,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  exchange: {
    icon: RefreshCw,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  transfer: {
    icon: Wallet,
    color: "text-purple-600",
    bg: "bg-purple-50",
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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isPortuguese ? "Atividade" : "Activity"}
        </h1>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={isPortuguese ? "Buscar transações..." : "Search transactions..."} 
              className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="bg-white rounded-2xl card-shadow p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {isPortuguese ? "Nenhuma transação ainda" : "No transactions yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">{title}</h3>
      <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
        {transactions.map((tx) => (
          <TransactionItem 
            key={tx.id} 
            tx={tx} 
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
  onClick,
  isPortuguese
}: { 
  tx: Transaction; 
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

  const statusColor = tx.status === "completed" 
    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
    : tx.status === "failed"
    ? "bg-red-50 text-red-600 border-red-100"
    : "bg-yellow-50 text-yellow-600 border-yellow-100";

  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
      data-testid={`activity-transaction-${tx.id}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{getTypeLabel(tx.type)}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">
              {format(new Date(tx.createdAt), "HH:mm")}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${statusColor}`}>
              {getStatusLabel(tx.status)}
            </span>
          </div>
        </div>
      </div>
      <span className={`font-semibold ${formatAmount().startsWith("+") ? "text-emerald-600" : "text-gray-900"}`}>
        {formatAmount()}
      </span>
    </div>
  );
}
