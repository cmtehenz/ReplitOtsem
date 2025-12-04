import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWallets, getRates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export function WalletCard() {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: () => getRates(),
    refetchInterval: 60000,
  });

  const calculateTotalBalance = () => {
    if (!wallets) return 0;
    
    const usdtRate = rates?.usdtBrl?.sell || 6.0;
    
    let total = 0;
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * usdtRate;
      }
    });
    
    return total;
  };

  const totalBalance = calculateTotalBalance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-medium">
          {isPortuguese ? "Saldo disponível" : "Available balance"}
        </span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-toggle-balance"
        >
          {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {isLoading ? (
        <div className="h-12 w-48 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <h2 
          className="text-4xl font-semibold text-gray-900 tracking-tight balance-text" 
          data-testid="text-total-balance"
        >
          {isVisible ? formatCurrency(totalBalance) : "R$ ••••••"}
        </h2>
      )}
    </div>
  );
}
