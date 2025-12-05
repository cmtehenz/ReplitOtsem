import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Share2, CheckCircle2, Copy, ArrowUpRight, ArrowDownLeft, Download, Receipt, Check, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";

export default function TransactionDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/transaction/:id");
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(100),
  });

  const transaction = transactions?.find(tx => tx.id === params?.id);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(language === "pt-BR" ? "Copiado!" : "Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6" />;
      case "pending":
        return <RefreshCw className="w-6 h-6 animate-spin" />;
      case "failed":
        return <XCircle className="w-6 h-6" />;
      default:
        return <CheckCircle2 className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-green-500 bg-green-500/10";
    }
  };

  const getStatusText = (status: string) => {
    if (language === "pt-BR") {
      switch (status) {
        case "completed": return "Concluído";
        case "pending": return "Pendente";
        case "failed": return "Falhou";
        default: return status;
      }
    }
    switch (status) {
      case "completed": return "Completed";
      case "pending": return "Pending";
      case "failed": return "Failed";
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    if (language === "pt-BR") {
      switch (type) {
        case "deposit": return "Depósito PIX";
        case "withdrawal": return "Saque PIX";
        case "exchange": return "Câmbio";
        case "transfer": return "Transferência";
        default: return type;
      }
    }
    switch (type) {
      case "deposit": return "PIX Deposit";
      case "withdrawal": return "PIX Withdrawal";
      case "exchange": return "Exchange";
      case "transfer": return "Transfer";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "exchange":
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  if (!transaction) {
    return (
      <PageContainer>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setLocation("/activity")}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg">{t("transaction.receipt")}</h1>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const displayAmount = transaction.type === "deposit" || transaction.type === "exchange"
    ? transaction.toAmount
    : transaction.fromAmount;
  const displayCurrency = transaction.type === "deposit" || transaction.type === "exchange"
    ? transaction.toCurrency
    : transaction.fromCurrency;

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/activity")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">{t("transaction.receipt")}</h1>
          <button 
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            data-testid="button-share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center w-full space-y-8">
          <div className="w-full relative">
            <div className="glass-card bg-white/5 border border-white/10 rounded-3xl p-8 pt-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-[#7c3aed] to-accent" />
              
              <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-4 border-card shadow-xl">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", getStatusColor(transaction.status))}>
                    {getStatusIcon(transaction.status)}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2 mt-4 mb-8">
                <p className={cn("font-bold text-lg", getStatusColor(transaction.status).split(" ")[0])}>
                  {getStatusText(transaction.status)}
                </p>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {format(new Date(transaction.createdAt), "MMM dd, yyyy • HH:mm")}
                </p>
                <h2 className="text-5xl font-display font-bold text-white tracking-tight py-4">
                  {displayCurrency === "BRL" ? "R$ " : ""}{parseFloat(displayAmount || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })} {displayCurrency !== "BRL" ? displayCurrency : ""}
                </h2>
              </div>

              <div className="space-y-6 relative">
                <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-white/10" />
                
                <div className="pt-6 space-y-5">
                  <DetailRow 
                    label={t("transaction.type")} 
                    value={getTypeText(transaction.type)} 
                    icon={getTypeIcon(transaction.type)} 
                  />
                  
                  <DetailRow 
                    label={language === "pt-BR" ? "Descrição" : "Description"} 
                    value={transaction.description} 
                  />
                  
                  {transaction.type === "exchange" && transaction.fromAmount && (
                    <DetailRow 
                      label={language === "pt-BR" ? "Valor Pago" : "Amount Paid"} 
                      value={`${parseFloat(transaction.fromAmount).toFixed(2)} ${transaction.fromCurrency}`} 
                    />
                  )}
                  
                  <div className="space-y-2 pt-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {t("transaction.transactionId")}
                    </span>
                    <div 
                      className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 group cursor-pointer hover:bg-black/30 transition-colors"
                      onClick={() => handleCopy(transaction.id)}
                    >
                      <code className="text-xs text-primary font-mono break-all">
                        {transaction.id.slice(0, 20)}...
                      </code>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 left-8 right-8 h-8 bg-primary/20 blur-xl rounded-full opacity-50" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-auto pt-4">
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold text-base"
              data-testid="button-save-pdf"
            >
              <Download className="w-5 h-5 mr-2" />
              {t("transaction.savePdf")}
            </Button>
            <Button 
              className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-lg shadow-primary/20"
              onClick={() => setLocation("/")}
              data-testid="button-new-transfer"
            >
              <Receipt className="w-5 h-5 mr-2" />
              {t("transaction.newTransfer")}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function DetailRow({ label, value, icon, mono }: { label: string, value: string, icon?: React.ReactNode, mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={cn("font-bold text-white flex items-center gap-2 text-right", mono && "font-mono text-xs")}>
        {icon}
        {value}
      </span>
    </div>
  );
}
