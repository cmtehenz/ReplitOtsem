import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const assets = [
  {
    id: "brl",
    name: "Brazilian Real",
    symbol: "BRL",
    balance: "R$ 4.250,00",
    price: "1.00",
    change: "+0.00%",
    icon: "🇧🇷",
    isFiat: true,
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.042 BTC",
    price: "R$ 345.201,20",
    change: "+2.45%",
    icon: "₿",
    isFiat: false,
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    balance: "1.5 ETH",
    price: "R$ 18.450,10",
    change: "-1.12%",
    icon: "Ξ",
    isFiat: false,
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    balance: "145 SOL",
    price: "R$ 845,30",
    change: "+12.5%",
    icon: "◎",
    isFiat: false,
  },
];

export function AssetList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-display font-medium">Assets</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      
      <div className="space-y-3">
        {assets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-card/50 hover:bg-card border border-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                asset.isFiat ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white"
              )}>
                {asset.icon}
              </div>
              <div>
                <div className="font-medium text-white">{asset.name}</div>
                <div className="text-xs text-muted-foreground">{asset.symbol}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium text-white">{asset.balance}</div>
              <div className={cn(
                "text-xs flex items-center justify-end gap-1",
                asset.change.startsWith("+") ? "text-green-400" : "text-red-400"
              )}>
                {asset.change.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {asset.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
