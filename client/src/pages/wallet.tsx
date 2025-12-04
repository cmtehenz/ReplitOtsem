import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Plus, Send, History, TrendingUp, Wallet as WalletIcon, Menu, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 6390 },
  { name: 'Sun', value: 4490 },
];

const assets = [
  { id: "usdt", name: "Tether", symbol: "USDT", balance: "1,420.00", value: "R$ 7.313,00", color: "text-[#26A17B]", bg: "bg-[#26A17B]/10" },
  { id: "btc", name: "Bitcoin", symbol: "BTC", balance: "0.042", value: "R$ 14.250,00", color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: "1.5", value: "R$ 18.450,00", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "brl", name: "Brazilian Real", symbol: "BRL", balance: "4.250,00", value: "R$ 4.250,00", color: "text-green-500", bg: "bg-green-500/10" },
];

export default function Wallet() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="p-6 space-y-6">
        <h1 className="font-display font-bold text-2xl">Wallet</h1>

        {/* Portfolio Chart */}
        <div className="bg-card border border-white/5 rounded-3xl p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <h2 className="text-3xl font-bold font-display">R$ 44.263,00</h2>
            <div className="flex items-center gap-2 mt-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+R$ 2.150 (5.2%)</span>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#26A17B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#26A17B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1b26', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#26A17B" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Deposit
            </Button>
            <Button className="bg-white/5 text-white hover:bg-white/10 border border-white/5">
              <Send className="w-4 h-4 mr-2" /> Send
            </Button>
            <Button className="bg-white/5 text-white hover:bg-white/10 border border-white/5">
              <ArrowDownLeft className="w-4 h-4 mr-2" /> Receive
            </Button>
          </div>
        </div>

        {/* Asset List */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Your Assets</h3>
          <div className="space-y-3">
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-card transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", asset.bg, asset.color)}>
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <p className="font-bold">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.balance} {asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{asset.value}</p>
                  <p className="text-xs text-green-500">+1.2%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="wallet" />
    </div>
  );
}

// Bottom Nav Component (Duplicated for now to avoid circular dependencies, in a real app this would be a shared component)
function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <NavButton icon={Menu} label="Home" active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={WalletIcon} label="Wallet" active={active === "wallet"} onClick={() => setLocation("/wallet")} />
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
