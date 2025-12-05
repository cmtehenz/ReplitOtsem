import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getWallets, getRates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export function AssetList() {
  const { t } = useLanguage();
  
  const { data: wallets, isLoading } = useQuery({
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

  const getAssetConfig = (currency: string) => {
    switch (currency) {
      case "USDT":
        return {
          name: t("assets.tether"),
          icon: "T",
          color: "text-[#26A17B] bg-[#26A17B]/10",
          price: `R$ ${usdtRate.toFixed(2)}`,
        };
      case "BRL":
        return {
          name: t("assets.brazilianReal"),
          icon: "R$",
          color: "text-green-500 bg-green-500/10",
          price: "R$ 1,00",
        };
      case "BTC":
        return {
          name: t("assets.bitcoin"),
          icon: "₿",
          color: "text-orange-500 bg-orange-500/10",
          price: `R$ ${(btcRate / 1000).toFixed(0)}k`,
        };
      default:
        return {
          name: currency,
          icon: "?",
          color: "text-gray-500 bg-gray-500/10",
          price: "-",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {t("assets.title")}
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          {t("assets.title")}
        </h3>
      </div>
      
      <div className="space-y-1">
        {wallets?.map((wallet, index) => {
          const config = getAssetConfig(wallet.currency);
          const balance = parseFloat(wallet.balance);
          const formattedBalance = wallet.currency === "BRL" 
            ? `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 });

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              data-testid={`asset-${wallet.currency}`}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  config.color
                )}>
                  {config.icon}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{config.name}</div>
                  <div className="text-xs text-muted-foreground font-medium">{config.price}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm text-white">{formattedBalance}</div>
                <div className="text-xs text-muted-foreground">{wallet.currency}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
