import { motion } from "framer-motion";
import { ArrowDownLeft, Plus, Send, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

const currencyConfig: Record<string, { name: string; symbol: string; color: string; bg: string; border: string; icon: string }> = {
  BRL: {
    name: "Brazilian Real",
    symbol: "BRL",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "R$",
  },
  USDT: {
    name: "Tether",
    symbol: "USDT",
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
    border: "border-[#26A17B]/20",
    icon: "T",
  },
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: "₿",
  },
};

export default function Wallet() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const calculateTotalBRL = () => {
    if (!wallets) return 0;
    let total = 0;
    wallets.forEach((wallet) => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * 5.15;
      } else if (wallet.currency === "BTC") {
        total += balance * 340000;
      }
    });
    return total;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">
          {t("wallet.title") || "Wallet"}
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="glass-card rounded-3xl p-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t("wallet.totalBalance") || "Total Balance"}
                </p>
                <h2 className="text-2xl font-bold font-display tracking-tight mt-1" data-testid="text-total-balance">
                  {formatCurrency(calculateTotalBRL())}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-gradient-to-br from-primary to-[#7c3aed] text-white hover:from-primary hover:to-[#6d28d9] border border-primary/40 h-12 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all active:scale-[0.98]"
                  data-testid="button-wallet-deposit"
                >
                  <Plus className="w-5 h-5 mr-1" /> {t("wallet.deposit") || "Deposit"}
                </Button>
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-12 rounded-xl font-bold text-sm shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-all active:scale-[0.98]"
                  data-testid="button-wallet-send"
                >
                  <Send className="w-5 h-5 mr-1" /> {t("wallet.send") || "Send"}
                </Button>
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-12 rounded-xl font-bold text-sm shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-all active:scale-[0.98]"
                  data-testid="button-wallet-receive"
                >
                  <ArrowDownLeft className="w-5 h-5 mr-1" /> {t("wallet.receive") || "Receive"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-medium text-lg tracking-tight">
                {t("wallet.yourAssets") || "Your Assets"}
              </h3>
              <div className="space-y-3">
                {wallets?.map((wallet, i) => {
                  const config = currencyConfig[wallet.currency] || currencyConfig.BRL;
                  const balance = parseFloat(wallet.balance);
                  let valueBRL = balance;
                  if (wallet.currency === "USDT") valueBRL = balance * 5.15;
                  if (wallet.currency === "BTC") valueBRL = balance * 340000;

                  return (
                    <motion.div
                      key={wallet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-4 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
                      data-testid={`wallet-asset-${wallet.currency}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border backdrop-blur-sm",
                          config.bg, config.color, config.border
                        )}>
                          {config.icon}
                        </div>
                        <div>
                          <p className="font-bold text-base">{config.name}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 })} {wallet.currency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base">{formatCurrency(valueBRL)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav active="wallet" />
    </div>
  );
}
