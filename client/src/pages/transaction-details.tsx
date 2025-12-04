import { PageContainer } from "@/components/page-container";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, Transaction } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function TransactionDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/transaction/:id");
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: transactions } = useQuery({
    queryKey: ["transactions", 100],
    queryFn: () => getTransactions(100),
  });

  const transaction = transactions?.find(tx => tx.id === params?.id);

  if (!transaction) {
    return (
      <PageContainer>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setLocation("/activity")}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg tracking-wide">
              {isPortuguese ? "Detalhes" : "Details"}
            </h1>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              {isPortuguese ? "Transação não encontrada" : "Transaction not found"}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-6 h-6" />;
      case "pending":
      case "processing":
        return <Clock className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "failed":
      case "cancelled":
        return "text-red-500 bg-red-500/10";
      case "pending":
      case "processing":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-muted-foreground bg-white/5";
    }
  };

  const getStatusText = (status: string) => {
    if (isPortuguese) {
      switch (status) {
        case "completed": return "Concluído";
        case "failed": return "Falhou";
        case "cancelled": return "Cancelado";
        case "pending": return "Pendente";
        case "processing": return "Processando";
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTypeText = (type: string) => {
    if (isPortuguese) {
      switch (type) {
        case "deposit": return "Depósito";
        case "withdrawal": return "Saque";
        case "exchange": return "Troca";
        case "transfer": return "Transferência";
        default: return type;
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isPortuguese ? "pt-BR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string | null, currency: string | null) => {
    if (!amount || !currency) return "-";
    const num = parseFloat(amount);
    if (currency === "BRL") {
      return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }
    return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: currency === "BTC" ? 8 : 2 })} ${currency}`;
  };
  
  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/activity")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {isPortuguese ? "Detalhes" : "Details"}
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center w-full space-y-6">
          <div className="w-full glass-card bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-[#7c3aed] to-accent" />
            
            <div className="text-center space-y-4 mb-8">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", getStatusColor(transaction.status))}>
                {getStatusIcon(transaction.status)}
              </div>
              <p className={cn("font-bold text-lg", getStatusColor(transaction.status).split(" ")[0])}>
                {getStatusText(transaction.status)}
              </p>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {formatDate(transaction.createdAt)}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <DetailRow 
                label={isPortuguese ? "Tipo" : "Type"} 
                value={getTypeText(transaction.type)} 
              />
              {transaction.fromAmount && transaction.fromCurrency && (
                <DetailRow 
                  label={isPortuguese ? "Valor Enviado" : "Amount Sent"} 
                  value={formatAmount(transaction.fromAmount, transaction.fromCurrency)} 
                />
              )}
              {transaction.toAmount && transaction.toCurrency && (
                <DetailRow 
                  label={isPortuguese ? "Valor Recebido" : "Amount Received"} 
                  value={formatAmount(transaction.toAmount, transaction.toCurrency)} 
                />
              )}
              {transaction.description && (
                <DetailRow 
                  label={isPortuguese ? "Descrição" : "Description"} 
                  value={transaction.description} 
                />
              )}
              <DetailRow 
                label="ID" 
                value={transaction.id.slice(0, 20) + "..."} 
                mono 
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function DetailRow({ label, value, mono }: { label: string, value: string, mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={cn("font-bold text-white text-right max-w-[60%] truncate", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}
