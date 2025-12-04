import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { CreditCard, Eye, EyeOff, Snowflake, Settings, Copy, Check, Lock, Unlock, Plus, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Cards() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isPortuguese = t("nav.home") === "Início";
  
  const [showDetails, setShowDetails] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardNumber = "4532 •••• •••• 8742";
  const cardNumberFull = "4532 8521 3654 8742";
  const expiryDate = "12/28";
  const cvv = "***";
  const cvvFull = "847";

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumberFull.replace(/\s/g, ""));
    setCopied(true);
    toast.success(isPortuguese ? "Número copiado!" : "Card number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFreeze = () => {
    setIsFrozen(!isFrozen);
    toast.success(isFrozen 
      ? (isPortuguese ? "Cartão desbloqueado" : "Card unfrozen")
      : (isPortuguese ? "Cartão bloqueado temporariamente" : "Card frozen temporarily")
    );
  };

  const cardActions = [
    { 
      icon: showDetails ? EyeOff : Eye, 
      label: isPortuguese ? (showDetails ? "Ocultar" : "Mostrar") : (showDetails ? "Hide" : "Show"),
      onClick: () => setShowDetails(!showDetails),
      color: "text-primary"
    },
    { 
      icon: isFrozen ? Unlock : Snowflake, 
      label: isPortuguese ? (isFrozen ? "Desbloquear" : "Congelar") : (isFrozen ? "Unfreeze" : "Freeze"),
      onClick: handleFreeze,
      color: isFrozen ? "text-emerald-400" : "text-blue-400"
    },
    { 
      icon: Copy, 
      label: isPortuguese ? "Copiar" : "Copy",
      onClick: handleCopyCard,
      color: "text-accent"
    },
    { 
      icon: Settings, 
      label: isPortuguese ? "Config" : "Settings",
      onClick: () => toast.info(isPortuguese ? "Em breve" : "Coming soon"),
      color: "text-muted-foreground"
    },
  ];

  const recentTransactions = [
    { merchant: "Spotify", amount: -14.90, date: "Today", icon: "🎵" },
    { merchant: "Uber", amount: -32.50, date: "Yesterday", icon: "🚗" },
    { merchant: "Amazon", amount: -189.90, date: "Dec 2", icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl tracking-tight">
            {isPortuguese ? "Meus Cartões" : "My Cards"}
          </h1>
          <button 
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all"
            onClick={() => toast.info(isPortuguese ? "Solicite um novo cartão em breve" : "Request a new card coming soon")}
            data-testid="button-add-card"
          >
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative perspective-1000"
        >
          <div className={cn(
            "relative w-full aspect-[1.586/1] rounded-3xl p-6 overflow-hidden transition-all duration-500",
            isFrozen 
              ? "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800" 
              : "bg-gradient-to-br from-primary via-[#7c3aed] to-[#5b21b6]"
          )}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            
            {isFrozen && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center">
                <div className="absolute inset-0 backdrop-blur-[1px]" />
                <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">{isPortuguese ? "Cartão Congelado" : "Card Frozen"}</span>
                </div>
              </div>
            )}

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Virtual Card</p>
                    <p className="text-white text-sm font-semibold">Otsem Pay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">Visa</p>
                  <div className="flex gap-1 mt-1">
                    <div className="w-6 h-4 rounded bg-white/90" />
                    <div className="w-6 h-4 rounded bg-accent/80 -ml-3" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">
                    {isPortuguese ? "Número do Cartão" : "Card Number"}
                  </p>
                  <p className="text-white text-xl font-mono tracking-[0.2em] font-medium" data-testid="text-card-number">
                    {showDetails ? cardNumberFull : cardNumber}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">
                      {isPortuguese ? "Titular" : "Card Holder"}
                    </p>
                    <p className="text-white text-sm font-medium uppercase tracking-wide">
                      {user?.name || user?.username || "USER NAME"}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">
                        {isPortuguese ? "Validade" : "Expires"}
                      </p>
                      <p className="text-white text-sm font-mono font-medium">{expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">CVV</p>
                      <p className="text-white text-sm font-mono font-medium">
                        {showDetails ? cvvFull : cvv}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between px-2"
        >
          {cardActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 group"
              data-testid={`button-card-action-${index}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all group-active:scale-95">
                <action.icon className={cn("w-5 h-5", action.color)} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {isPortuguese ? "Limites" : "Limits"}
            </h2>
          </div>
          
          <div className="premium-card rounded-2xl p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isPortuguese ? "Gasto Mensal" : "Monthly Spending"}</span>
                <span className="font-medium">R$ 2.450 / R$ 5.000</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full w-[49%] bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isPortuguese ? "Saque Diário" : "Daily Withdrawal"}</span>
                <span className="font-medium">R$ 0 / R$ 1.000</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full w-[0%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {isPortuguese ? "Transações Recentes" : "Recent Transactions"}
            </h2>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.map((tx, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="premium-card rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer"
                data-testid={`card-transaction-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">
                    {tx.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.merchant}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-red-400">
                  R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav active="cards" />
    </div>
  );
}
