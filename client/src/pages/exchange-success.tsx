import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import { useLanguage } from "@/context/LanguageContext";

interface ExchangeData {
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  rate: string;
  fee: string;
  feePercent: string;
  transactionId: string;
}

export default function ExchangeSuccess() {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  const { language } = useLanguage();

  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    
    const storedData = sessionStorage.getItem("lastExchange");
    if (storedData) {
      try {
        setExchangeData(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse exchange data");
      }
    }
    
    return () => clearTimeout(timer);
  }, []);

  const t = {
    title: language === "pt-BR" ? "Conversão Realizada!" : "Exchange Successful!",
    converted: language === "pt-BR" ? "Você converteu com sucesso" : "You successfully converted",
    to: language === "pt-BR" ? "para" : "to",
    rate: language === "pt-BR" ? "Taxa" : "Rate",
    fee: language === "pt-BR" ? "Tarifa" : "Fee",
    transactionId: language === "pt-BR" ? "ID da Transação" : "Transaction ID",
    backHome: language === "pt-BR" ? "Voltar ao Início" : "Back to Home",
    viewReceipt: language === "pt-BR" ? "Ver Comprovante" : "View Receipt",
  };

  const formatCurrency = (amount: string, currency: string) => {
    const value = parseFloat(amount);
    if (currency === "BRL") {
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ${currency}`;
  };

  const displayFromAmount = exchangeData?.fromAmount || "500.00";
  const displayFromCurrency = exchangeData?.fromCurrency || "BRL";
  const displayToAmount = exchangeData?.toAmount || "97.08";
  const displayToCurrency = exchangeData?.toCurrency || "USDT";
  const displayRate = exchangeData?.rate || "5.15";
  const displayFee = exchangeData?.fee || "2.50";
  const displayFeePercent = exchangeData?.feePercent || "0.5";
  const displayTxId = exchangeData?.transactionId || `EX-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} colors={['#26A17B', '#8B5CF6', '#ffffff']} />}

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-sm w-full text-center space-y-8 relative z-10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary relative z-10">
            <CheckCircle2 className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold" data-testid="text-exchange-success">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.converted} <br />
            <span className="text-white font-medium">{formatCurrency(displayFromAmount, displayFromCurrency)}</span> {t.to} <span className="text-[#26A17B] font-medium">{formatCurrency(displayToAmount, displayToCurrency)}</span>
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.rate}</span>
            <span className="font-medium">1 {displayToCurrency} = R$ {parseFloat(displayRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.fee}</span>
            <span className="font-medium">R$ {parseFloat(displayFee).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({displayFeePercent}%)</span>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.transactionId}</span>
            <span className="font-mono text-xs">#{displayTxId}</span>
          </div>
        </div>

        <div className="space-y-3 w-full">
          <Button 
            onClick={() => setLocation("/")}
            className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            data-testid="button-back-home"
          >
            {t.backHome}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg border-white/10 hover:bg-white/5 rounded-xl"
            onClick={() => setLocation("/activity")}
            data-testid="button-view-receipt"
          >
            {t.viewReceipt}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
