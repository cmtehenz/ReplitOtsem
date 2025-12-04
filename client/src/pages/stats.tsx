import { useState, useMemo } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, getWallets, type Transaction } from "@/lib/api";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";

export default function Stats() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  const [period, setPeriod] = useState<Period>("month");

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  const filterTransactionsByPeriod = (txs: Transaction[], p: Period): Transaction[] => {
    const now = new Date();
    let startDate: Date;

    switch (p) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return txs.filter(tx => new Date(tx.createdAt) >= startDate);
  };

  const calculateStats = useMemo(() => {
    const filteredTxs = filterTransactionsByPeriod(transactions, period);
    
    let income = 0;
    let expenses = 0;
    let exchanges = 0;

    filteredTxs.forEach(tx => {
      if (tx.type === "deposit" && tx.toAmount) {
        income += parseFloat(tx.toAmount);
      } else if (tx.type === "withdrawal" && tx.fromAmount) {
        expenses += parseFloat(tx.fromAmount);
      } else if (tx.type === "exchange") {
        exchanges += 1;
      }
    });

    return { income, expenses, exchanges };
  }, [transactions, period]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysPt = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    const result = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
        day: isPortuguese ? daysPt[date.getDay()] : days[date.getDay()],
        date: date.toISOString().split("T")[0],
        income: 0,
        expense: 0,
      };
    });

    transactions.forEach(tx => {
      const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
      const dayData = result.find(d => d.date === txDate);
      
      if (dayData) {
        if (tx.type === "deposit" && tx.toAmount) {
          dayData.income += parseFloat(tx.toAmount);
        } else if (tx.type === "withdrawal" && tx.fromAmount) {
          dayData.expense += parseFloat(tx.fromAmount);
        }
      }
    });

    return result;
  }, [transactions, isPortuguese]);

  const maxValue = Math.max(...weeklyData.map(d => Math.max(d.income, d.expense)), 100);

  const netFlow = calculateStats.income - calculateStats.expenses;

  const categories = [
    { name: isPortuguese ? "Depósitos" : "Deposits", amount: calculateStats.income, color: "bg-emerald-500", icon: ArrowDownLeft },
    { name: isPortuguese ? "Saques" : "Withdrawals", amount: calculateStats.expenses, color: "bg-red-500", icon: ArrowUpRight },
    { name: isPortuguese ? "Trocas" : "Exchanges", amount: calculateStats.exchanges, color: "bg-primary", icon: BarChart3, isCount: true },
  ];

  const periodLabels = {
    week: isPortuguese ? "Esta Semana" : "This Week",
    month: isPortuguese ? "Este Mês" : "This Month",
    year: isPortuguese ? "Este Ano" : "This Year",
  };

  const isLoading = transactionsLoading || walletsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-otsem-gradient text-foreground pb-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl tracking-tight">
            {isPortuguese ? "Estatísticas" : "Statistics"}
          </h1>
          <button 
            className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm font-medium hover:bg-white/[0.08] transition-all"
            data-testid="button-period-select"
            onClick={() => {
              const periods: Period[] = ["week", "month", "year"];
              const currentIndex = periods.indexOf(period);
              setPeriod(periods[(currentIndex + 1) % periods.length]);
            }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {periodLabels[period]}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {isPortuguese ? "Fluxo Líquido" : "Net Flow"}
              </p>
              <p className={cn(
                "text-3xl font-bold font-display",
                netFlow >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {netFlow >= 0 ? "+" : "-"}R$ {Math.abs(netFlow).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              netFlow >= 0 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
            )}>
              {netFlow >= 0 ? (
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400/80 font-medium">
                  {isPortuguese ? "Entradas" : "Income"}
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-400">
                R$ {calculateStats.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400/80 font-medium">
                  {isPortuguese ? "Saídas" : "Expenses"}
                </span>
              </div>
              <p className="text-lg font-bold text-red-400">
                R$ {calculateStats.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {isPortuguese ? "Atividade Semanal" : "Weekly Activity"}
          </h2>

          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-1 items-center" style={{ height: "100px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.income / maxValue) * 100}%` }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                      className="w-full max-w-[20px] bg-emerald-500/60 rounded-t"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.expense / maxValue) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      className="w-full max-w-[20px] bg-red-500/60 rounded-b"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/60" />
                <span className="text-xs text-muted-foreground">
                  {isPortuguese ? "Entradas" : "Income"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/60" />
                <span className="text-xs text-muted-foreground">
                  {isPortuguese ? "Saídas" : "Expenses"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {isPortuguese ? "Por Categoria" : "By Category"}
          </h2>

          <div className="space-y-3">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="premium-card rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `${category.color}/10`)}>
                      <category.icon className={cn("w-5 h-5", category.color.replace("bg-", "text-"))} />
                    </div>
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <span className="font-bold text-sm">
                    {category.isCount ? category.amount : `R$ ${category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((category.amount / (calculateStats.income || 1)) * 100, 100)}%` }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    className={cn("h-full rounded-full", category.color)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {isPortuguese ? "Carteiras" : "Wallets"}
          </h2>

          {wallets.length === 0 ? (
            <div className="premium-card rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">
                {isPortuguese ? "Nenhuma carteira encontrada" : "No wallets found"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {wallets.map((wallet, index) => {
                const balance = parseFloat(wallet.balance);
                const colors: Record<string, string> = {
                  BRL: "emerald",
                  USDT: "teal",
                  BTC: "orange",
                };
                const color = colors[wallet.currency] || "primary";

                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="premium-card rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border",
                        `bg-${color}-500/10 border-${color}-500/20 text-${color}-400`
                      )}>
                        {wallet.currency === "BRL" ? "R$" : wallet.currency === "BTC" ? "₿" : "T"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{wallet.currency}</p>
                        <p className="text-xs text-muted-foreground">
                          {wallet.currency === "BRL" ? "Brazilian Real" : wallet.currency === "USDT" ? "Tether" : "Bitcoin"}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">
                      {wallet.currency === "BRL" 
                        ? `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 })}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
