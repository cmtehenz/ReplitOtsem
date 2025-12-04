import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/lib/api";

const assetConfig: Record<string, { name: string; icon: string; color: string; bgColor: string; price: string }> = {
  USDT: {
    name: "Tether",
    icon: "T",
    color: "text-[#26A17B]",
    bgColor: "bg-[#26A17B]/12",
    price: "R$ 5,15",
  },
  BRL: {
    name: "Brazilian Real",
    icon: "R$",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/12",
    price: "1.00",
  },
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-400",
    bgColor: "bg-orange-500/12",
    price: "R$ 345k",
  },
};

export function AssetList() {
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="px-1">
          <h3 className="section-title">Assets</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06]" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-white/[0.06] rounded" />
                  <div className="h-3 w-14 bg-white/[0.04] rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
                <div className="h-3 w-10 bg-white/[0.04] rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h3 className="section-title">Assets</h3>
      </div>
      
      <div className="space-y-2">
        {wallets?.map((wallet, index) => {
          const config = assetConfig[wallet.currency];
          const balance = parseFloat(wallet.balance);
          const formattedBalance = wallet.currency === "BRL" 
            ? `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 });

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold border border-white/[0.06]",
                  config.bgColor,
                  config.color
                )}>
                  {config.icon}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm text-foreground group-hover:text-foreground transition-colors">{config.name}</div>
                  <div className="text-[11px] text-muted-foreground/60 font-medium">{config.price}</div>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="font-semibold text-sm text-foreground">{formattedBalance}</div>
                <div className="text-[11px] text-muted-foreground/60 font-medium">{wallet.currency}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
