import { useState, useMemo } from "react";
import { ArrowUpDown, Info, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { executeExchange, getWallets, getRates } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

export function ExchangeCard() {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: rates, isLoading: ratesLoading, error: ratesError, refetch: refetchRates } = useQuery({
    queryKey: ["rates"],
    queryFn: getRates,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const exchangeMutation = useMutation({
    mutationFn: (data: { fromCurrency: string; toCurrency: string; amount: string }) =>
      executeExchange(data.fromCurrency, data.toCurrency, data.amount),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      const outputAmount = calculateOutput();
      const exchangeData = {
        fromAmount: amount,
        fromCurrency,
        toAmount: outputAmount,
        toCurrency,
        rate: currentRate.toFixed(2),
        fee: rates?.fee?.toString() || "0.95",
        feePercent: rates?.fee?.toString() || "0.95",
        transactionId: result?.transactionId || `EX-${Date.now().toString(36).toUpperCase()}`,
      };
      sessionStorage.setItem("lastExchange", JSON.stringify(exchangeData));
      
      setAmount("");
      setLocation("/exchange-success");
    },
    onError: (error: any) => {
      toast.error(error.message || t("exchange.failed"));
    },
  });

  const fromCurrency = mode === "buy" ? "BRL" : "USDT";
  const toCurrency = mode === "buy" ? "USDT" : "BRL";
  
  const currentRate = useMemo(() => {
    if (!rates) return 0;
    return mode === "buy" ? rates.usdtBrl.buy : rates.usdtBrl.sell;
  }, [rates, mode]);

  const getBalance = (currency: string) => {
    const wallet = wallets?.find(w => w.currency === currency);
    if (!wallet) return "0.00";
    const balance = parseFloat(wallet.balance);
    return balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getNumericBalance = (currency: string) => {
    const wallet = wallets?.find(w => w.currency === currency);
    if (!wallet) return 0;
    return parseFloat(wallet.balance);
  };
  
  const calculateOutput = () => {
    if (!amount || !currentRate) return "";
    const val = parseFloat(amount);
    if (isNaN(val)) return "";
    
    if (mode === "buy") {
      const usdtAmount = val / currentRate;
      return usdtAmount.toFixed(6);
    } else {
      const brlAmount = val * currentRate;
      return brlAmount.toFixed(2);
    }
  };

  const minBrlAmount = useMemo(() => {
    if (!rates) return 0;
    return rates.minBrl;
  }, [rates]);

  const isAmountValid = useMemo(() => {
    if (!amount || !rates) return false;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return false;
    
    if (mode === "buy") {
      return val >= rates.minBrl;
    } else {
      return val >= rates.minUsdt;
    }
  }, [amount, rates, mode]);

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;
    const val = parseFloat(amount);
    if (isNaN(val)) return false;
    return val > getNumericBalance(fromCurrency);
  }, [amount, fromCurrency, wallets]);

  const handleSwap = () => {
    setMode(mode === "buy" ? "sell" : "buy");
    setAmount("");
  };

  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t("exchange.invalidAmount"));
      return;
    }

    if (!isAmountValid) {
      toast.error(t("exchange.minAmount"));
      return;
    }

    if (hasInsufficientBalance) {
      toast.error(t("exchange.insufficientBalance"));
      return;
    }

    exchangeMutation.mutate({
      fromCurrency,
      toCurrency,
      amount,
    });
  };

  if (ratesError) {
    return (
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden" data-testid="exchange-error">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{t("exchange.ratesUnavailable")}</p>
          <Button variant="outline" onClick={() => refetchRates()} data-testid="button-retry-rates">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="exchange-section" className="glass-card rounded-3xl p-6 space-y-6 relative overflow-hidden" data-testid="exchange-card">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-medium">{t("exchange.title")}</h3>
        <div className="flex items-center gap-2">
          {ratesLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{t("exchange.loadingRate")}</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => refetchRates()}
              data-testid="rate-display"
            >
              <Info className="w-3 h-3" />
              <span>1 USDT ≈ R$ {currentRate.toFixed(2)}</span>
              <RefreshCw className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-background/50 border border-white/5 rounded-2xl p-4 space-y-2 transition-colors focus-within:border-primary/30">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("exchange.youPay")}</span>
            <span>{t("exchange.balance")}: {getBalance(fromCurrency)} {fromCurrency}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-2xl font-medium focus:outline-none w-full placeholder:text-muted-foreground/30"
              data-testid="input-exchange-amount"
            />
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl shrink-0">
              {mode === "buy" ? (
                <span className="w-6 h-6 flex items-center justify-center text-lg">🇧🇷</span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-lg bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              )}
              <span className="font-medium">{fromCurrency}</span>
            </div>
          </div>
          {hasInsufficientBalance && (
            <p className="text-xs text-destructive" data-testid="text-insufficient-balance">
              {t("exchange.insufficientBalance")}
            </p>
          )}
        </div>

        <div className="flex justify-center -my-4 relative z-10">
          <button 
            onClick={handleSwap}
            className="bg-card border border-white/10 p-2 rounded-xl hover:border-primary/50 hover:text-primary transition-all shadow-lg"
            data-testid="button-swap-direction"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-background/50 border border-white/5 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("exchange.youReceive")}</span>
            <span>{t("exchange.estimated")}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={calculateOutput()}
              readOnly
              placeholder="0.00"
              className="bg-transparent text-2xl font-medium focus:outline-none w-full placeholder:text-muted-foreground/30 text-primary"
              data-testid="input-exchange-output"
            />
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl shrink-0">
              {mode === "buy" ? (
                <span className="w-6 h-6 flex items-center justify-center text-lg bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-lg">🇧🇷</span>
              )}
              <span className="font-medium">{toCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {rates && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{t("exchange.fee")}: {rates.fee}%</span>
          <span>{t("exchange.minimum")}: {rates.minUsdt} USDT (≈ R$ {minBrlAmount.toFixed(2)})</span>
        </div>
      )}

      <Button 
        className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium shadow-[0_0_20px_rgba(50,188,173,0.2)]"
        onClick={handleExchange}
        disabled={exchangeMutation.isPending || !amount || !isAmountValid || hasInsufficientBalance || ratesLoading}
        data-testid="button-exchange"
      >
        {exchangeMutation.isPending ? t("common.processing") : mode === "buy" ? t("exchange.buyUsdt") : t("exchange.sellUsdt")}
      </Button>
    </div>
  );
}
