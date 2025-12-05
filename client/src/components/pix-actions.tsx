import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPixDeposit, getWallets, getPixKeys, createPixWithdrawal } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
}

export function ActionButtons({ onSend, onReceive }: ActionButtonsProps) {
  const { language } = useLanguage();
  
  const scrollToExchange = () => {
    const element = document.getElementById('exchange-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3 w-full max-w-md mx-auto">
      <SendPixButton />
      <ReceivePixButton />
      <div 
        className="flex flex-col items-center gap-2 group cursor-pointer"
        onClick={scrollToExchange}
        data-testid="button-swap"
      >
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white group-hover:bg-white/20 transition-all duration-300 border border-white/5">
          <RefreshCw className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
          {language === "pt-BR" ? "Trocar" : "Swap"}
        </span>
      </div>
      <TopUpButton />
    </div>
  );
}

function SendPixButton() {
  const [open, setOpen] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const t = {
    pixSend: language === "pt-BR" ? "Enviar Pix" : "Pix Send",
    sendPix: language === "pt-BR" ? "Enviar Pix" : "Send Pix",
    available: language === "pt-BR" ? "Disponível" : "Available",
    pixKeyLabel: language === "pt-BR" ? "Chave Pix (CPF, Email, Telefone)" : "Pix Key (CPF, Email, Phone)",
    pixKeyPlaceholder: language === "pt-BR" ? "usuario@email.com" : "user@example.com",
    amountBrl: language === "pt-BR" ? "Valor (BRL)" : "Amount (BRL)",
    confirmTransfer: language === "pt-BR" ? "Confirmar Transferência" : "Confirm Transfer",
    enterPixKey: language === "pt-BR" ? "Digite uma chave PIX" : "Please enter a PIX key",
    minAmount: language === "pt-BR" ? "Valor mínimo é R$ 1,00" : "Minimum amount is R$ 1.00",
    insufficientBalance: language === "pt-BR" ? "Saldo insuficiente" : "Insufficient balance",
    comingSoon: language === "pt-BR" ? "Transferências PIX para chaves externas em breve!" : "PIX transfers to external keys coming soon!",
  };

  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const brlBalance = wallets?.find(w => w.currency === "BRL")?.balance || "0";

  const handleSend = () => {
    if (!pixKey.trim()) {
      toast.error(t.enterPixKey);
      return;
    }
    if (!amount || parseFloat(amount) < 1) {
      toast.error(t.minAmount);
      return;
    }
    if (parseFloat(amount) > parseFloat(brlBalance)) {
      toast.error(t.insufficientBalance);
      return;
    }
    toast.info(t.comingSoon);
    setOpen(false);
    setPixKey("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-2 group cursor-pointer" data-testid="button-pix-send">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border border-primary/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{t.pixSend}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-display">{t.sendPix}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            {t.available}: <span className="text-white font-bold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t.pixKeyLabel}</label>
            <input 
              type="text" 
              placeholder={t.pixKeyPlaceholder}
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-primary/50 transition-colors"
              data-testid="input-pix-key"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t.amountBrl}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <input 
                type="number" 
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                className="w-full bg-background border border-white/10 rounded-xl p-4 pl-10 text-lg focus:outline-none focus:border-primary/50 transition-colors"
                data-testid="input-send-amount"
              />
            </div>
          </div>
          <Button 
            className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            onClick={handleSend}
            data-testid="button-confirm-send"
          >
            {t.confirmTransfer}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceivePixButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pixData, setPixData] = useState<{ pixCopiaECola: string; txid: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { language, t } = useLanguage();

  const labels = {
    pixReceive: language === "pt-BR" ? "Receber Pix" : "Pix Receive",
    receiveViaPix: language === "pt-BR" ? "Receber via PIX" : "Receive via PIX",
    pixPayment: language === "pt-BR" ? "Pagamento PIX" : "PIX Payment",
    amountBrl: language === "pt-BR" ? "Valor (BRL)" : "Amount (BRL)",
    generatePix: language === "pt-BR" ? "Gerar PIX" : "Generate PIX",
    scanOrCopy: language === "pt-BR" ? "Escaneie o QR code ou copie a chave abaixo" : "Scan the QR code or copy the key below",
    pixCopyPaste: language === "pt-BR" ? "PIX Copia e Cola" : "PIX Copy & Paste",
    copied: language === "pt-BR" ? "Copiado!" : "Copied!",
    copyPixKey: language === "pt-BR" ? "Copiar Chave PIX" : "Copy PIX Key",
    minDeposit: language === "pt-BR" ? "Depósito mínimo é R$ 1,00" : "Minimum deposit is R$ 1.00",
    copiedToClipboard: language === "pt-BR" ? "Copiado para a área de transferência!" : "Copied to clipboard!",
  };

  const depositMutation = useMutation({
    mutationFn: createPixDeposit,
    onSuccess: (data) => {
      setPixData({ pixCopiaECola: data.pixCopiaECola, txid: data.txid });
    },
    onError: (error: any) => {
      toast.error(error.message || (language === "pt-BR" ? "Falha ao criar depósito" : "Failed to create deposit"));
    },
  });

  const handleCreateDeposit = () => {
    if (!amount || parseFloat(amount) < 1) {
      toast.error(labels.minDeposit);
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      toast.success(labels.copiedToClipboard);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAmount("");
    setPixData(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-2 group cursor-pointer" data-testid="button-pix-receive">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border border-primary/20">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{labels.pixReceive}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-display">
            {pixData ? labels.pixPayment : labels.receiveViaPix}
          </DialogTitle>
        </DialogHeader>
        
        {!pixData ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-base text-muted-foreground font-bold ml-1">{labels.amountBrl}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <input 
                  type="number" 
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full bg-background/50 border border-white/10 rounded-2xl p-5 pl-12 text-2xl focus:outline-none focus:border-primary/50 focus:bg-background/70 transition-all font-medium"
                  data-testid="input-receive-amount"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateDeposit}
              disabled={depositMutation.isPending}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[#7c3aed] text-white text-lg font-bold"
              data-testid="button-generate-receive-pix"
            >
              {depositMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                labels.generatePix
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl">
                <QRCode value={pixData.pixCopiaECola} size={200} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">{labels.scanOrCopy}</p>
              <p className="text-2xl font-bold text-primary">R$ {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">{labels.pixCopyPaste}</p>
              <p className="text-xs font-mono break-all text-muted-foreground/80">{pixData.pixCopiaECola.slice(0, 50)}...</p>
            </div>
            <Button 
              onClick={handleCopy}
              className="w-full h-14 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20"
              data-testid="button-copy-receive-pix"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? labels.copied : labels.copyPixKey}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TopUpButton() {
  const [open, setOpen] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState("");
  const [pixData, setPixData] = useState<{ pixCopiaECola: string; txid: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();

  const t = {
    topUp: language === "pt-BR" ? "Adicionar" : "Top Up",
    topUpWallet: language === "pt-BR" ? "Adicionar Saldo" : "Top Up Wallet",
    depositBrl: language === "pt-BR" ? "Depositar BRL" : "Deposit BRL",
    depositUsdt: language === "pt-BR" ? "Depositar USDT" : "Deposit USDT",
    pixPayment: language === "pt-BR" ? "Pagamento PIX" : "PIX Payment",
    amountBrl: language === "pt-BR" ? "Valor (BRL)" : "Amount (BRL)",
    generatePix: language === "pt-BR" ? "Gerar PIX" : "Generate PIX",
    scanOrCopy: language === "pt-BR" ? "Escaneie o QR code ou copie a chave abaixo" : "Scan the QR code or copy the key below",
    pixCopyPaste: language === "pt-BR" ? "PIX Copia e Cola" : "PIX Copy & Paste",
    copied: language === "pt-BR" ? "Copiado!" : "Copied!",
    copyPixKey: language === "pt-BR" ? "Copiar Chave PIX" : "Copy PIX Key",
    minDeposit: language === "pt-BR" ? "Depósito mínimo é R$ 1,00" : "Minimum deposit is R$ 1.00",
    copiedToClipboard: language === "pt-BR" ? "Copiado para a área de transferência!" : "Copied to clipboard!",
    usdtComingSoon: language === "pt-BR" ? "Depósitos USDT em breve!" : "USDT deposits coming soon!",
  };

  const depositMutation = useMutation({
    mutationFn: createPixDeposit,
    onSuccess: (data) => {
      setPixData({ pixCopiaECola: data.pixCopiaECola, txid: data.txid });
    },
    onError: (error: any) => {
      toast.error(error.message || (language === "pt-BR" ? "Falha ao criar depósito" : "Failed to create deposit"));
    },
  });

  const handleCreateDeposit = () => {
    if (!amount || parseFloat(amount) < 1) {
      toast.error(t.minDeposit);
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      toast.success(t.copiedToClipboard);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setShowDeposit(false);
    setAmount("");
    setPixData(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-2 group cursor-pointer" data-testid="button-topup">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white group-hover:bg-white/20 transition-all duration-300 border border-white/5">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">{t.topUp}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display">
            {showDeposit ? (pixData ? t.pixPayment : t.depositBrl) : t.topUpWallet}
          </DialogTitle>
        </DialogHeader>
        
        {!showDeposit ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button 
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all"
              onClick={() => setShowDeposit(true)}
              data-testid="button-deposit-brl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="font-bold text-sm">Pix</span>
              </div>
              <span className="text-sm font-medium">{t.depositBrl}</span>
            </button>
            <button 
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all"
              onClick={() => toast.info(t.usdtComingSoon)}
              data-testid="button-deposit-usdt"
            >
              <div className="w-12 h-12 rounded-xl bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B]">
                <span className="font-bold text-lg">T</span>
              </div>
              <span className="text-sm font-medium">{t.depositUsdt}</span>
            </button>
          </div>
        ) : !pixData ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-base text-muted-foreground font-bold ml-1">{t.amountBrl}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <input 
                  type="number" 
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full bg-background/50 border border-white/10 rounded-2xl p-5 pl-12 text-2xl focus:outline-none focus:border-primary/50 focus:bg-background/70 transition-all font-medium"
                  data-testid="input-topup-amount"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateDeposit}
              disabled={depositMutation.isPending}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[#7c3aed] text-white text-lg font-bold"
              data-testid="button-generate-pix"
            >
              {depositMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.generatePix
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl">
                <QRCode value={pixData.pixCopiaECola} size={200} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">{t.scanOrCopy}</p>
              <p className="text-2xl font-bold text-primary">R$ {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">{t.pixCopyPaste}</p>
              <p className="text-xs font-mono break-all text-muted-foreground/80">{pixData.pixCopiaECola.slice(0, 50)}...</p>
            </div>
            <Button 
              onClick={handleCopy}
              className="w-full h-14 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20"
              data-testid="button-copy-topup-pix"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? t.copied : t.copyPixKey}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
