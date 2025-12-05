import { ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";
import { BottomNav } from "@/components/bottom-nav";

const data = [
  { name: 'Mon', income: 4000, expense: 2400 },
  { name: 'Tue', income: 3000, expense: 1398 },
  { name: 'Wed', income: 2000, expense: 9800 },
  { name: 'Thu', income: 2780, expense: 3908 },
  { name: 'Fri', income: 1890, expense: 4800 },
  { name: 'Sat', income: 2390, expense: 3800 },
  { name: 'Sun', income: 3490, expense: 4300 },
];

export default function Stats() {
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">Statistics</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-3xl p-5 space-y-3 group hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Income</p>
              <p className="text-xl font-bold font-display tracking-tight mt-1">R$ 12.450</p>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-5 space-y-3 group hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Expense</p>
              <p className="text-xl font-bold font-display tracking-tight mt-1">R$ 8.230</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-display text-lg">Weekly Activity</h3>
            <button className="bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-colors font-medium">
              This Week <Calendar className="w-3 h-3" />
            </button>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: 'rgba(26, 27, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                   itemStyle={{ color: '#fff', fontWeight: 500 }}
                />
                <Bar dataKey="income" fill="#26A17B" radius={[6, 6, 6, 6]} barSize={8} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 6, 6]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="space-y-4">
          <h3 className="font-bold font-display text-lg">Top Categories</h3>
          <div className="space-y-3">
             <CategoryRow label="Shopping" amount="R$ 2.450" percent={35} color="bg-purple-500" />
             <CategoryRow label="Food & Drink" amount="R$ 1.240" percent={22} color="bg-orange-500" />
             <CategoryRow label="Services" amount="R$ 890" percent={15} color="bg-blue-500" />
             <CategoryRow label="Crypto" amount="R$ 3.420" percent={28} color="bg-[#26A17B]" />
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
