import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const assets = [
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    balance: "1,420.00",
    price: "R$ 5,15",
    icon: "T",
    color: "text-[#26A17B] bg-[#26A17B]/10",
  },
  {
    id: "brl",
    name: "Brazilian Real",
    symbol: "BRL",
    balance: "R$ 4.250,00",
    price: "1.00",
    icon: "R$",
    color: "text-green-500 bg-green-500/10",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.0045",
    price: "R$ 345k",
    icon: "₿",
    color: "text-orange-500 bg-orange-500/10",
  },
];

export function AssetList() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Assets</h3>
      </div>
      
      <div className="space-y-1">
        {assets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                asset.color
              )}>
                {asset.icon}
              </div>
              <div>
                <div className="font-bold text-sm text-white">{asset.name}</div>
                <div className="text-xs text-muted-foreground font-medium">{asset.price}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-sm text-white">{asset.balance}</div>
              <div className="text-xs text-muted-foreground">{asset.symbol}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
