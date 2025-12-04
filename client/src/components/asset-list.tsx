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
    color: "text-[#26A17B] bg-[#26A17B]/10",
  },
  {
    id: "brl",
    name: "Brazilian Real",
    symbol: "BRL",
    balance: "R$ 4.250,00",
    price: "1.00",
    change: "+0.00%",
    icon: "🇧🇷",
    isFiat: true,
    color: "text-green-500 bg-green-500/10",
  },
];

export function AssetList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-display font-medium">Your Balances</h3>
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
                asset.color
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
              <div className="text-xs text-muted-foreground">
                ≈ {asset.price} BRL
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
