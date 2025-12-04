import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownLeft, DollarSign, Menu, Wallet, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Bar, BarChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

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
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl">Statistics</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-xl font-bold">R$ 12.450</p>
          </div>
          <div className="bg-card border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground">Total Expense</p>
            <p className="text-xl font-bold">R$ 8.230</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Weekly Activity</h3>
            <button className="bg-white/5 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
              This Week <Calendar className="w-3 h-3" />
            </button>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: '#1a1b26', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="income" fill="#26A17B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="space-y-4">
          <h3 className="font-bold">Top Categories</h3>
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
    <div className="bg-card/50 p-4 rounded-2xl border border-white/5 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{amount}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden flex items-center">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Bottom Nav Component
function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <NavButton icon={Menu} label="Home" active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={Wallet} label="Wallet" active={active === "wallet"} onClick={() => setLocation("/wallet")} />
        <div 
          className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(50,188,173,0.4)] border-4 border-background cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setLocation("/")}
        >
          <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
        </div>
        <NavButton icon={TrendingUp} label="Stats" active={active === "stats"} onClick={() => setLocation("/stats")} />
        <NavButton icon={Menu} label="Cards" active={active === "cards"} onClick={() => setLocation("/cards")} />
      </div>
    </nav>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-16 py-1 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-white"
      )}
    >
      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
        <div className={cn("w-3 h-3 rounded-sm", active ? "bg-primary" : "bg-muted-foreground")} />
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
