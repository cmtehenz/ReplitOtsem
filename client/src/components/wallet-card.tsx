import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Wallet, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/lib/api";

export function WalletCard() {
  const [isVisible, setIsVisible] = useState(true);
  
  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  // Calculate total balance in BRL
  const calculateTotalBalance = () => {
    if (!wallets) return "0,00";
    
    let total = 0;
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * 5.15; // USDT to BRL rate
      } else if (wallet.currency === "BTC") {
        total += balance * 345201; // BTC to BRL rate
      }
    });
    
    return total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1b26] to-[#0f0f16] border border-white/5 shadow-lg"
    >
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
          </div>
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Balance */}
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            {isVisible ? `R$ ${calculateTotalBalance()}` : "••••••••"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+R$ 1.250 (12.5%)</span>
            </div>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
