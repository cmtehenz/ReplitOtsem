import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const assets = [
  {
    id: "usdt",
    name: "Tether USD",
    symbol: "USDT",
    balance: "1,420.00 USDT",
    price: "R$ 5,15",
    change: "+0.05%",
    icon: "T",
    isFiat: false,
    color: "text-[#26A17B] bg-[#26A17B]/10 border-[#26A17B]/20",
  },
  {
    id: "brl",
    name: "Brazilian Real",
    symbol: "BRL",
    balance: "R$ 4.250,00",
    price: "1.00",
    change: "+0.00%",
    icon: "R$",
    isFiat: true,
    color: "text-green-500 bg-green-500/10 border-green-500/20",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.0045 BTC",
    price: "R$ 345.201",
    change: "+2.4%",
    icon: "₿",
    isFiat: false,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
];

export function AssetList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-display font-medium tracking-tight">Your Balances</h3>
      </div>
      
      <div className="space-y-3">
        {assets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-3xl glass-card hover:bg-white/10 border border-white/5 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold border backdrop-blur-sm",
                asset.color
              )}>
                {asset.icon}
              </div>
              <div>
                <div className="font-medium text-white text-base">{asset.name}</div>
                <div className="text-xs text-muted-foreground font-medium">{asset.symbol}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-white text-base tracking-tight">{asset.balance}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                ≈ {asset.price} BRL
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
