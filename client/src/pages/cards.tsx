import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CreditCard, Eye, EyeOff, Snowflake, Settings, Copy, Lock, Unlock, Plus, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCard, getCardDetails, updateCardStatus, getTransactions, type VirtualCard, type Transaction } from "@/lib/api";

export default function Cards() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPortuguese = t("nav.home") === "Início";
  
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ["card"],
    queryFn: getCard,
  });

  const { data: cardDetails } = useQuery({
    queryKey: ["cardDetails"],
    queryFn: getCardDetails,
    enabled: showDetails,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(5),
  });

  const freezeMutation = useMutation({
    mutationFn: (status: "active" | "frozen") => updateCardStatus(status),
    onSuccess: (updatedCard) => {
      queryClient.setQueryData(["card"], updatedCard);
      toast.success(updatedCard.status === "frozen" 
        ? (isPortuguese ? "Cartão bloqueado" : "Card frozen")
        : (isPortuguese ? "Cartão desbloqueado" : "Card unfrozen")
      );
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro ao atualizar" : "Failed to update");
    },
  });

  const isFrozen = card?.status === "frozen";
  const displayCard = showDetails && cardDetails ? cardDetails : card;
  
  const formatCardNumber = (num: string, show: boolean) => {
    if (show && cardDetails) {
      return cardDetails.cardNumber.replace(/(.{4})/g, "$1 ").trim();
    }
    return `**** **** **** ${displayCard?.last4 || "****"}`;
  };

  const handleCopyCard = () => {
    if (cardDetails) {
      navigator.clipboard.writeText(cardDetails.cardNumber);
      setCopied(true);
      toast.success(isPortuguese ? "Copiado!" : "Copied!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      setShowDetails(true);
    }
  };

  const handleFreeze = () => {
    const newStatus = isFrozen ? "active" : "frozen";
    freezeMutation.mutate(newStatus);
  };

  const cardActions = [
    { 
      icon: showDetails ? EyeOff : Eye, 
      label: isPortuguese ? (showDetails ? "Ocultar" : "Mostrar") : (showDetails ? "Hide" : "Show"),
      onClick: () => setShowDetails(!showDetails),
    },
    { 
      icon: isFrozen ? Unlock : Snowflake, 
      label: isPortuguese ? (isFrozen ? "Desbloquear" : "Congelar") : (isFrozen ? "Unfreeze" : "Freeze"),
      onClick: handleFreeze,
      loading: freezeMutation.isPending
    },
    { 
      icon: Copy, 
      label: isPortuguese ? "Copiar" : "Copy",
      onClick: handleCopyCard,
    },
    { 
      icon: Settings, 
      label: isPortuguese ? "Config" : "Settings",
      onClick: () => toast.info(isPortuguese ? "Em breve" : "Coming soon"),
    },
  ];

  const formatTransactionAmount = (tx: Transaction) => {
    if (tx.type === "deposit" && tx.toAmount) {
      return { amount: parseFloat(tx.toAmount), isPositive: true };
    }
    if (tx.type === "withdrawal" && tx.fromAmount) {
      return { amount: parseFloat(tx.fromAmount), isPositive: false };
    }
    if (tx.type === "exchange" && tx.fromAmount) {
      return { amount: parseFloat(tx.fromAmount), isPositive: false };
    }
    return { amount: 0, isPositive: true };
  };

  if (cardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isPortuguese ? "Meus Cartões" : "My Cards"}
          </h1>
          <button 
            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all"
            onClick={() => toast.info(isPortuguese ? "Em breve" : "Coming soon")}
            data-testid="button-add-card"
          >
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="relative">
          <div className={cn(
            "relative w-full aspect-[1.586/1] rounded-2xl p-6 overflow-hidden transition-all duration-300",
            isFrozen 
              ? "bg-gradient-to-br from-gray-500 to-gray-700" 
              : "bg-gradient-to-br from-primary via-blue-600 to-blue-700"
          )}>
            {isFrozen && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Lock className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">{isPortuguese ? "Congelado" : "Frozen"}</span>
                </div>
              </div>
            )}

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider">Virtual Card</p>
                    <p className="text-white text-sm font-semibold">Otsem Pay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-[10px] uppercase tracking-wider">Visa</p>
                  <div className="flex gap-1 mt-1">
                    <div className="w-6 h-4 rounded bg-white/90" />
                    <div className="w-6 h-4 rounded bg-yellow-500/80 -ml-3" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                    {isPortuguese ? "Número do Cartão" : "Card Number"}
                  </p>
                  <p className="text-white text-xl font-mono tracking-[0.15em]" data-testid="text-card-number">
                    {formatCardNumber(displayCard?.cardNumber || "", showDetails)}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                      {isPortuguese ? "Titular" : "Card Holder"}
                    </p>
                    <p className="text-white text-sm font-medium uppercase">
                      {displayCard?.cardholderName || user?.name || user?.username || "CARDHOLDER"}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                        {isPortuguese ? "Validade" : "Expires"}
                      </p>
                      <p className="text-white text-sm font-mono">
                        {displayCard?.expiryMonth || "**"}/{displayCard?.expiryYear?.slice(-2) || "**"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">CVV</p>
                      <p className="text-white text-sm font-mono">
                        {showDetails && cardDetails ? cardDetails.cvv : "***"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between px-4">
          {cardActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={'loading' in action && action.loading}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
              data-testid={`button-card-action-${index}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                {'loading' in action && action.loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : (
                  <action.icon className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <span className="text-[10px] font-medium text-gray-500">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {isPortuguese ? "Limites" : "Limits"}
          </h2>
          
          <div className="bg-white rounded-2xl p-4 card-shadow space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{isPortuguese ? "Gasto Mensal" : "Monthly Spending"}</span>
                <span className="font-medium text-gray-900">R$ 0 / R$ {parseFloat(displayCard?.monthlyLimit || "5000").toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[0%] bg-primary rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{isPortuguese ? "Saque Diário" : "Daily Withdrawal"}</span>
                <span className="font-medium text-gray-900">R$ 0 / R$ {parseFloat(displayCard?.dailyWithdrawalLimit || "1000").toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[0%] bg-accent rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {isPortuguese ? "Transações Recentes" : "Recent Transactions"}
          </h2>
          
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 card-shadow text-center">
              <p className="text-gray-500">
                {isPortuguese ? "Nenhuma transação" : "No transactions yet"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
              {transactions.slice(0, 3).map((tx) => {
                const { amount, isPositive } = formatTransactionAmount(tx);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4"
                    data-testid={`card-transaction-${tx.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tx.type === "deposit" ? "bg-emerald-50" : tx.type === "exchange" ? "bg-blue-50" : "bg-gray-100"
                      )}>
                        <span className="text-base">
                          {tx.type === "deposit" ? "💰" : tx.type === "exchange" ? "🔄" : "💸"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={cn(
                      "font-semibold",
                      isPositive ? "text-emerald-600" : "text-gray-900"
                    )}>
                      {isPositive ? "+" : "-"} R$ {amount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="cards" />
    </div>
  );
}
