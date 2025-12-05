import { ArrowUpRight, ArrowDownLeft, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BottomNav } from "@/components/bottom-nav";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  weeklyData: { day: string; income: number; expense: number }[];
  categoryBreakdown: { category: string; amount: number; percent: number }[];
}

export default function Stats() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === "pt-BR" ? "Estatísticas" : "Statistics",
    totalIncome: language === "pt-BR" ? "Receita Total" : "Total Income",
    totalExpense: language === "pt-BR" ? "Despesa Total" : "Total Expense",
    weeklyActivity: language === "pt-BR" ? "Atividade Semanal" : "Weekly Activity",
    thisWeek: language === "pt-BR" ? "Esta Semana" : "This Week",
    topCategories: language === "pt-BR" ? "Categorias Principais" : "Top Categories",
    noData: language === "pt-BR" ? "Nenhuma transação encontrada" : "No transactions found",
    deposits: language === "pt-BR" ? "Depósitos" : "Deposits",
    withdrawals: language === "pt-BR" ? "Saques" : "Withdrawals",
    exchanges: language === "pt-BR" ? "Conversões" : "Exchanges",
  };

  const categoryLabels: Record<string, string> = {
    "Deposits": t.deposits,
    "Withdrawals": t.withdrawals,
    "Exchanges": t.exchanges,
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "pt-BR" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Deposits":
        return "bg-green-500";
      case "Withdrawals":
        return "bg-red-500";
      case "Exchanges":
        return "bg-primary";
      default:
        return "bg-blue-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-otsem-gradient text-foreground pb-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <BottomNav active="stats" />
      </div>
    );
  }

  const hasData = stats && (stats.totalIncome > 0 || stats.totalExpense > 0);

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">{t.title}</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-3xl p-5 space-y-3 group hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t.totalIncome}</p>
              <p className="text-xl font-bold font-display tracking-tight mt-1" data-testid="total-income">
                {formatCurrency(stats?.totalIncome || 0)}
              </p>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-5 space-y-3 group hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t.totalExpense}</p>
              <p className="text-xl font-bold font-display tracking-tight mt-1" data-testid="total-expense">
                {formatCurrency(stats?.totalExpense || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-display text-lg">{t.weeklyActivity}</h3>
            <button className="bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-colors font-medium">
              {t.thisWeek} <Calendar className="w-3 h-3" />
            </button>
          </div>
          
          <div className="h-[200px] w-full">
            {hasData && stats?.weeklyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyData} barGap={8}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(26, 27, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 500 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" fill="#26A17B" radius={[6, 6, 6, 6]} barSize={8} name={t.totalIncome} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 6, 6]} barSize={8} name={t.totalExpense} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {t.noData}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold font-display text-lg">{t.topCategories}</h3>
          <div className="space-y-3">
            {hasData && stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              stats.categoryBreakdown.map((category) => (
                <CategoryRow 
                  key={category.category}
                  label={categoryLabels[category.category] || category.category} 
                  amount={formatCurrency(category.amount)} 
                  percent={category.percent} 
                  color={getCategoryColor(category.category)} 
                />
              ))
            ) : (
              <div className="glass-card p-4 rounded-2xl text-center text-muted-foreground text-sm">
                {t.noData}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav active="stats" />
    </div>
  );
}

function CategoryRow({ label, amount, percent, color }: { label: string, amount: string, percent: number, color: string }) {
  return (
    <div className="glass-card p-4 rounded-2xl space-y-3 hover:bg-white/5 transition-colors cursor-pointer">
      <div className="flex justify-between text-sm items-center">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{amount}</span>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden flex items-center">
        <div className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
