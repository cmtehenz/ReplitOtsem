import { useState, useMemo } from "react";
import { ArrowUpDown, Info, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { executeExchange, getWallets, getRates } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export function ExchangeCard() {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const { t } = useLanguage();

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
      toast.success(t("exchange.success"));
      setAmount("");
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
      <div className="premium-card rounded-3xl p-8 relative overflow-hidden" data-testid="exchange-error">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-muted-foreground">{t("exchange.ratesUnavailable")}</p>
          <Button 
            variant="outline" 
            onClick={() => refetchRates()} 
            className="rounded-xl border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08]"
            data-testid="button-retry-rates"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="exchange-section" className="premium-card rounded-3xl p-6 space-y-5 relative overflow-hidden" data-testid="exchange-card">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold">{t("exchange.title")}</h3>
        <div className="flex items-center gap-2">
          {ratesLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{t("exchange.loadingRate")}</span>
            </div>
          ) : (
            <button 
              className="flex items-center gap-2 text-[11px] text-muted-foreground bg-white/[0.04] px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/[0.08] transition-all duration-200 border border-white/[0.06]"
              onClick={() => refetchRates()}
              data-testid="rate-display"
            >
              <Info className="w-3 h-3" />
              <span className="font-medium">1 USDT ≈ R$ {currentRate.toFixed(2)}</span>
              <RefreshCw className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3 transition-all duration-200 focus-within:border-primary/30 focus-within:bg-white/[0.05]">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">{t("exchange.youPay")}</span>
            <span className="font-medium">{t("exchange.balance")}: {getBalance(fromCurrency)} {fromCurrency}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-2xl font-semibold focus:outline-none w-full placeholder:text-muted-foreground/20"
              data-testid="input-exchange-amount"
            />
            <div className="flex items-center gap-2.5 bg-white/[0.06] px-4 py-2 rounded-xl shrink-0 border border-white/[0.06]">
              {mode === "buy" ? (
                <span className="w-6 h-6 flex items-center justify-center text-base">🇧🇷</span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              )}
              <span className="font-semibold text-sm">{fromCurrency}</span>
            </div>
          </div>
          {hasInsufficientBalance && (
            <p className="text-xs text-destructive font-medium" data-testid="text-insufficient-balance">
              {t("exchange.insufficientBalance")}
            </p>
          )}
        </div>

        <div className="flex justify-center -my-3 relative z-10">
          <button 
            onClick={handleSwap}
            className="bg-card border border-white/[0.1] p-3 rounded-xl hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 shadow-lg"
            data-testid="button-swap-direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">{t("exchange.youReceive")}</span>
            <span className="font-medium">{t("exchange.estimated")}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={calculateOutput()}
              readOnly
              placeholder="0.00"
              className="bg-transparent text-2xl font-semibold focus:outline-none w-full placeholder:text-muted-foreground/20 text-primary"
              data-testid="input-exchange-output"
            />
            <div className="flex items-center gap-2.5 bg-white/[0.06] px-4 py-2 rounded-xl shrink-0 border border-white/[0.06]">
              {mode === "buy" ? (
                <span className="w-6 h-6 flex items-center justify-center bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-base">🇧🇷</span>
              )}
              <span className="font-semibold text-sm">{toCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {rates && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 px-1">
          <span className="font-medium">{t("exchange.fee")}: {rates.fee}%</span>
          <span className="font-medium">{t("exchange.minimum")}: {rates.minUsdt} USDT (≈ R$ {minBrlAmount.toFixed(2)})</span>
        </div>
      )}

      <Button 
        className="w-full h-14 text-base premium-button rounded-2xl"
        onClick={handleExchange}
        disabled={exchangeMutation.isPending || !amount || !isAmountValid || hasInsufficientBalance || ratesLoading}
        data-testid="button-exchange"
      >
        {exchangeMutation.isPending ? t("common.processing") : mode === "buy" ? t("exchange.buyUsdt") : t("exchange.sellUsdt")}
      </Button>
    </div>
  );
}
