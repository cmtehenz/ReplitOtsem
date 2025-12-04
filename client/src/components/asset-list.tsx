import { useQuery } from "@tanstack/react-query";
import { getWallets, getRates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

const assetConfig: Record<string, { name: string; icon: string; color: string; bgColor: string }> = {
  USDT: {
    name: "Tether",
    icon: "T",
    color: "text-[#26A17B]",
    bgColor: "bg-[#26A17B]/10",
  },
  BRL: {
    name: "Brazilian Real",
    icon: "R$",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
};

export function AssetList() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  const [, setLocation] = useLocation();
  
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: () => getRates(),
    refetchInterval: 60000,
  });

  const getPrice = (currency: string) => {
    if (currency === "BRL") return "R$ 1,00";
    if (currency === "USDT" && rates?.usdtBrl?.sell) {
      return `R$ ${rates.usdtBrl.sell.toFixed(2).replace(".", ",")}`;
    }
    return "—";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {isPortuguese ? "Ativos" : "Assets"}
        </h3>
        <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-14 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
                <div className="h-3 w-10 bg-gray-50 rounded animate-pulse ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {isPortuguese ? "Ativos" : "Assets"}
      </h3>
      
      <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
        {wallets?.map((wallet) => {
          const config = assetConfig[wallet.currency];
          const balance = parseFloat(wallet.balance);
          const formattedBalance = wallet.currency === "BRL" 
            ? `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 });

          return (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setLocation("/wallet")}
              data-testid={`asset-${wallet.currency}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${config.bgColor} ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{config.name}</div>
                  <div className="text-sm text-gray-500">{getPrice(wallet.currency)}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900">{formattedBalance}</div>
                <div className="text-sm text-gray-500">{wallet.currency}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
