import { motion } from "framer-motion";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWallets, getRates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export function WalletCard() {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();
  
  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: () => getRates(),
    refetchInterval: 60000,
  });

  const calculateTotalBalance = () => {
    if (!wallets) return "0,00";
    
    const usdtRate = rates?.usdtBrl?.sell;
    
    let total = 0;
    let hasUnknownRate = false;
    
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT" && usdtRate) {
        total += balance * usdtRate;
      } else if (wallet.currency === "USDT" && !usdtRate) {
        hasUnknownRate = true;
      } else if (wallet.currency === "BTC" && balance > 0) {
        hasUnknownRate = true;
      }
    });
    
    if (hasUnknownRate && total === 0) {
      return null;
    }
    
    return total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalBalance = calculateTotalBalance();

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
              <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-[0.12em]">
                {t("wallet.total") || "Total Balance"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 border border-white/[0.06]"
            data-testid="button-toggle-balance"
          >
            {isVisible ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-[38px] font-display font-bold tracking-tight text-foreground leading-none" data-testid="text-total-balance">
              {isVisible 
                ? (totalBalance ? `R$ ${totalBalance}` : "—") 
                : "••••••••"}
            </h1>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
}
