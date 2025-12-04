import { motion } from "framer-motion";
import { ArrowDownLeft, Plus, Send, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { getWallets, getRates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

const assetConfig: Record<string, { name: string; icon: string; color: string; bg: string; border: string }> = {
  USDT: {
    name: "Tether",
    icon: "T",
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
    border: "border-[#26A17B]/20",
  },
  BRL: {
    name: "Brazilian Real",
    icon: "R$",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
};

export default function Wallet() {
  const [, setLocation] = useLocation();
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
    if (!wallets) return null;
    
    const usdtRate = rates?.usdtBrl?.sell;
    
    let total = 0;
    let hasUnknownRate = false;
    
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT" && usdtRate) {
        total += balance * usdtRate;
      } else if (wallet.currency === "USDT" && !usdtRate && balance > 0) {
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

  const getValueInBrl = (balance: string, currency: string) => {
    const amount = parseFloat(balance);
    const usdtRate = rates?.usdtBrl?.sell;
    
    if (currency === "BRL") {
      return `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === "USDT" && usdtRate) {
      const value = amount * usdtRate;
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return "—";
  };

  const totalBalance = calculateTotalBalance();

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">
          {isPortuguese ? "Carteira" : "Wallet"}
        </h1>

        <div className="premium-card rounded-3xl p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground/70 font-medium">
              {isPortuguese ? "Saldo Total" : "Total Balance"}
            </p>
            <h2 className="text-3xl font-bold font-display tracking-tight mt-1">
              {totalBalance ? `R$ ${totalBalance}` : "—"}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button 
              onClick={() => setLocation("/")}
              className="bg-gradient-to-br from-primary to-[#7c3aed] text-white hover:from-primary hover:to-[#6d28d9] border border-primary/40 h-12 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Depositar" : "Deposit"}
            </Button>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Enviar" : "Send"}
            </Button>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
            >
              <ArrowDownLeft className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Receber" : "Receive"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-medium text-lg tracking-tight">
            {isPortuguese ? "Seus Ativos" : "Your Assets"}
          </h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06]" />
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-white/[0.06] rounded" />
                      <div className="h-3 w-14 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-24 bg-white/[0.06] rounded" />
                </div>
              ))}
            </div>
          ) : !wallets?.length ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">
                {isPortuguese ? "Nenhum ativo ainda" : "No assets yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet, i) => {
                const config = assetConfig[wallet.currency];
                const balance = parseFloat(wallet.balance);
                const formattedBalance = wallet.currency === "BRL"
                  ? balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                  : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 });

                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="premium-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border",
                        config.bg, config.color, config.border
                      )}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{config.name}</p>
                        <p className="text-xs text-muted-foreground/60 font-medium">
                          {formattedBalance} {wallet.currency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {getValueInBrl(wallet.balance, wallet.currency)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="wallet" />
    </div>
  );
}
