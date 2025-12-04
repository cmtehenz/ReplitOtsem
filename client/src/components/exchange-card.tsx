import { useState, useMemo } from "react";
import { ArrowUpDown, RefreshCw, AlertCircle } from "lucide-react";
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
  const isPortuguese = t("nav.home") === "Início";

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
    onSuccess: () => {
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

    exchangeMutation.mutate({ fromCurrency, toCurrency, amount });
  };

  if (ratesError) {
    return (
      <div id="exchange-section" className="bg-white rounded-2xl p-6 card-shadow" data-testid="exchange-error">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-500">{t("exchange.ratesUnavailable")}</p>
          <Button 
            variant="outline" 
            onClick={() => refetchRates()} 
            className="rounded-xl"
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
    <div id="exchange-section" className="bg-white rounded-2xl p-6 card-shadow space-y-5" data-testid="exchange-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t("exchange.title")}</h3>
        {ratesLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>{t("exchange.loadingRate")}</span>
          </div>
        ) : (
          <button 
            className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => refetchRates()}
            data-testid="rate-display"
          >
            <span className="font-medium">1 USDT = R$ {currentRate.toFixed(2)}</span>
            <RefreshCw className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span className="font-medium">{t("exchange.youPay")}</span>
            <span>{t("exchange.balance")}: {getBalance(fromCurrency)} {fromCurrency}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-2xl font-semibold text-gray-900 focus:outline-none w-full placeholder:text-gray-300"
              data-testid="input-exchange-amount"
            />
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shrink-0 border border-gray-100">
              {mode === "buy" ? (
                <span className="text-base">🇧🇷</span>
              ) : (
                <span className="w-5 h-5 flex items-center justify-center bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              )}
              <span className="font-medium text-sm text-gray-900">{fromCurrency}</span>
            </div>
          </div>
          {hasInsufficientBalance && (
            <p className="text-xs text-red-500 font-medium" data-testid="text-insufficient-balance">
              {t("exchange.insufficientBalance")}
            </p>
          )}
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button 
            onClick={handleSwap}
            className="bg-white border border-gray-200 p-2.5 rounded-xl hover:border-primary hover:text-primary transition-colors shadow-sm"
            data-testid="button-swap-direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span className="font-medium">{t("exchange.youReceive")}</span>
            <span className="font-medium">{t("exchange.estimated")}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={calculateOutput()}
              readOnly
              placeholder="0.00"
              className="bg-transparent text-2xl font-semibold text-primary focus:outline-none w-full placeholder:text-gray-300"
              data-testid="input-exchange-output"
            />
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shrink-0 border border-gray-100">
              {mode === "buy" ? (
                <span className="w-5 h-5 flex items-center justify-center bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              ) : (
                <span className="text-base">🇧🇷</span>
              )}
              <span className="font-medium text-sm text-gray-900">{toCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {rates && (
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>{t("exchange.fee")}: {rates.fee}%</span>
          <span>{t("exchange.minimum")}: {rates.minUsdt} USDT</span>
        </div>
      )}

      <Button 
        className="w-full h-14 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
        onClick={handleExchange}
        disabled={exchangeMutation.isPending || !amount || !isAmountValid || hasInsufficientBalance || ratesLoading}
        data-testid="button-exchange"
      >
        {exchangeMutation.isPending 
          ? t("common.processing") 
          : mode === "buy" 
            ? (isPortuguese ? "Comprar USDT" : "Buy USDT")
            : (isPortuguese ? "Vender USDT" : "Sell USDT")
        }
      </Button>
    </div>
  );
}
