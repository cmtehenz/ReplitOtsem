import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const assets = [
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    balance: "34,209",
    value: "6,534.95 USD",
    icon: "https://cryptologos.cc/logos/solana-sol-logo.png?v=024", // Using web URL for now, but would use local asset
    color: "bg-black text-white",
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    balance: "1,087",
    value: "1,134.95 USD",
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=024",
    color: "bg-[#26A17B] text-white",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    balance: "4.52",
    value: "8,234.10 USD",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024",
    color: "bg-[#627EEA] text-white",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.42",
    value: "12,402.22 USD",
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024",
    color: "bg-[#F7931A] text-white",
  }
];

export function AssetList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {assets.map((asset, index) => (
        <motion.div
          key={asset.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-[1.5rem] p-4 shadow-soft relative overflow-hidden hover:shadow-lg transition-shadow border border-black/5 group cursor-pointer h-[160px] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center overflow-hidden", asset.color)}>
                {/* Fallback if image fails, strictly text */}
                <img src={asset.icon} alt={asset.symbol} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span className="text-[10px] font-bold hidden group-hover:block">{asset.symbol[0]}</span>
              </div>
              <span className="font-bold text-sm text-black">{asset.name}</span>
            </div>
            <button className="text-gray-300 hover:text-black transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Info */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-bold text-black">{asset.balance}</h3>
              <span className="text-xs font-medium text-gray-400">{asset.symbol}</span>
            </div>
            <p className="text-[10px] font-medium text-gray-400">{asset.value}</p>
          </div>

          {/* Decorative Wave at bottom (optional, mimics reference) */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent opacity-50" />
        </motion.div>
      ))}
    </div>
  );
}
