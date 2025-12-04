import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api";
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {isPortuguese ? "Atividade Recente" : "Recent Activity"}
          </h3>
        </div>
        <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {isPortuguese ? "Atividade Recente" : "Recent Activity"}
          </h3>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-8 text-center">
          <p className="text-gray-400">
            {isPortuguese ? "Nenhuma transação ainda" : "No transactions yet"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {isPortuguese ? "Atividade Recente" : "Recent Activity"}
        </h3>
        <button 
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          onClick={() => setLocation("/activity")}
          data-testid="button-view-all-transactions"
        >
          {isPortuguese ? "Ver tudo" : "View all"}
        </button>
      </div>

      <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
        {transactions?.slice(0, 5).map((tx) => {
          const config = typeConfig[tx.type] || typeConfig.transfer;
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
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setLocation(`/transaction/${tx.id}`)}
              data-testid={`transaction-row-${tx.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">{tx.description}</h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              </div>
              
              <span className={`font-semibold ${displayAmount.startsWith("+") ? "text-emerald-600" : "text-gray-900"}`}>
                {displayAmount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
