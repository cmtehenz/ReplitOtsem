import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Plus, Send, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

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
  { id: "usdt", name: "Tether", symbol: "USDT", balance: "1,420.00", value: "R$ 7.313,00", color: "text-[#26A17B]", bg: "bg-[#26A17B]/10", border: "border-[#26A17B]/20" },
  { id: "btc", name: "Bitcoin", symbol: "BTC", balance: "0.042", value: "R$ 14.250,00", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: "1.5", value: "R$ 18.450,00", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "brl", name: "Brazilian Real", symbol: "BRL", balance: "4.250,00", value: "R$ 4.250,00", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
];

export default function Wallet() {
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">Wallet</h1>

        {/* Portfolio Chart */}
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Balance</p>
            <h2 className="text-3xl font-bold font-display tracking-tight mt-1">R$ 44.263,00</h2>
            <div className="flex items-center gap-2 mt-2 text-green-500 text-sm bg-green-500/10 w-fit px-2 py-1 rounded-lg border border-green-500/20">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">+R$ 2.150 (5.2%)</span>
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
                  contentStyle={{ backgroundColor: 'rgba(26, 27, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="value" stroke="#26A17B" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <Button className="bg-gradient-to-br from-primary to-[#7c3aed] text-white hover:from-primary hover:to-[#6d28d9] border border-primary/40 h-16 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
              <Plus className="w-6 h-6" /> Deposit
            </Button>
            <Button className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-16 rounded-2xl font-bold text-sm shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 hover:scale-[1.03] transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
              <Send className="w-6 h-6" /> Send
            </Button>
            <Button className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-16 rounded-2xl font-bold text-sm shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 hover:scale-[1.03] transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
              <ArrowDownLeft className="w-6 h-6" /> Receive
            </Button>
          </div>
        </div>

        {/* Asset List */}
        <div className="space-y-4">
          <h3 className="font-display font-medium text-lg tracking-tight">Your Assets</h3>
          <div className="space-y-3">
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border backdrop-blur-sm", asset.bg, asset.color, asset.border)}>
                    {asset.symbol === "USDT" ? "T" : asset.symbol === "BTC" ? "₿" : asset.symbol[0]}
                  </div>
                  <div>
                    <p className="font-bold text-base">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{asset.balance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base">{asset.value}</p>
                  <p className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-lg inline-block mt-1 border border-green-500/20">+1.2%</p>
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
