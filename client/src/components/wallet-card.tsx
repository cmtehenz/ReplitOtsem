import { motion } from "framer-motion";
import { Eye, EyeOff, Wallet, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/lib/api";

export function WalletCard() {
  const [isVisible, setIsVisible] = useState(true);
  
  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  const calculateTotalBalance = () => {
    if (!wallets) return "0,00";
    
    let total = 0;
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * 5.15;
      } else if (wallet.currency === "BTC") {
        total += balance * 345201;
      }
    });
    
    return total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 rounded-[28px] blur-xl opacity-60" />
      
      <div className="relative premium-card rounded-[28px] p-7">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-[0.12em]">Total Balance</span>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 border border-white/[0.06]"
          >
            {isVisible ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-[38px] font-display font-bold tracking-tight text-foreground leading-none">
              {isVisible ? `R$ ${calculateTotalBalance()}` : "••••••••"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+R$ 1.250</span>
              <span className="text-emerald-400/70">(12.5%)</span>
            </div>
            <span className="text-[11px] text-muted-foreground/60 font-medium">this month</span>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
}
