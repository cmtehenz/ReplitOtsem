import { motion } from "framer-motion";
import { Eye, EyeOff, Wallet, TrendingUp } from "lucide-react";
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
    queryFn: getRates,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const usdtRate = rates?.usdtBrl?.buy || 5.15;
  const btcRate = usdtRate * 65000;

  const calculateTotalBalance = () => {
    if (!wallets) return "0,00";
    
    let total = 0;
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * usdtRate;
      } else if (wallet.currency === "BTC") {
        total += balance * btcRate;
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t("wallet.totalBalance")}</span>
          </div>
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="text-muted-foreground hover:text-white transition-colors"
            data-testid="button-toggle-balance"
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white" data-testid="text-wallet-balance">
            {isVisible ? `R$ ${calculateTotalBalance()}` : "••••••••"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+0.0%</span>
            </div>
            <span className="text-xs text-muted-foreground">{t("wallet.thisMonth")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
