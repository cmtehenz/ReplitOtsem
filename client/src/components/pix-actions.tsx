import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPixDeposit, getWallets, getPixKeys, createPixWithdrawal } from "@/lib/api";
import { toast } from "sonner";

interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
}

export function ActionButtons({ onSend, onReceive }: ActionButtonsProps) {
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
        <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">Swap</span>
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

  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const brlBalance = wallets?.find(w => w.currency === "BRL")?.balance || "0";

  const handleSend = () => {
    if (!pixKey.trim()) {
      toast.error("Please enter a PIX key");
      return;
    }
    if (!amount || parseFloat(amount) < 1) {
      toast.error("Minimum amount is R$ 1.00");
      return;
    }
    if (parseFloat(amount) > parseFloat(brlBalance)) {
      toast.error("Insufficient balance");
      return;
    }
    toast.info("PIX transfers to external keys coming soon!");
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
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Pix Send</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-display">Send Pix</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Available: <span className="text-white font-bold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Chave Pix (CPF, Email, Phone)</label>
            <input 
              type="text" 
              placeholder="user@example.com"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-primary/50 transition-colors"
              data-testid="input-pix-key"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Amount (BRL)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <input 
                type="number" 
                placeholder="0.00"
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
            Confirm Transfer
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

  const depositMutation = useMutation({
    mutationFn: createPixDeposit,
    onSuccess: (data) => {
      setPixData({ pixCopiaECola: data.pixCopiaECola, txid: data.txid });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create deposit");
    },
  });

  const handleCreateDeposit = () => {
    if (!amount || parseFloat(amount) < 1) {
      toast.error("Minimum deposit is R$ 1.00");
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      toast.success("Copied to clipboard!");
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
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Pix Receive</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-display">
            {pixData ? "PIX Payment" : "Receive via PIX"}
          </DialogTitle>
        </DialogHeader>
        
        {!pixData ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-base text-muted-foreground font-bold ml-1">Amount (BRL)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
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
                "Generate PIX"
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
              <p className="text-sm text-muted-foreground">Scan the QR code or copy the key below</p>
              <p className="text-2xl font-bold text-primary">R$ {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">PIX Copy & Paste</p>
              <p className="text-xs font-mono break-all text-muted-foreground/80">{pixData.pixCopiaECola.slice(0, 50)}...</p>
            </div>
            <Button 
              onClick={handleCopy}
              className="w-full h-14 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20"
              data-testid="button-copy-receive-pix"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Copy PIX Key"}
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

  const depositMutation = useMutation({
    mutationFn: createPixDeposit,
    onSuccess: (data) => {
      setPixData({ pixCopiaECola: data.pixCopiaECola, txid: data.txid });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create deposit");
    },
  });

  const handleCreateDeposit = () => {
    if (!amount || parseFloat(amount) < 1) {
      toast.error("Minimum deposit is R$ 1.00");
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      toast.success("Copied to clipboard!");
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
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">Top Up</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display">
            {showDeposit ? (pixData ? "PIX Payment" : "Deposit BRL") : "Top Up Wallet"}
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
              <span className="text-sm font-medium">Deposit BRL</span>
            </button>
            <button 
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all"
              onClick={() => toast.info("USDT deposits coming soon!")}
              data-testid="button-deposit-usdt"
            >
              <div className="w-12 h-12 rounded-xl bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B]">
                <span className="font-bold text-lg">T</span>
              </div>
              <span className="text-sm font-medium">Deposit USDT</span>
            </button>
          </div>
        ) : !pixData ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-base text-muted-foreground font-bold ml-1">Amount (BRL)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
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
                "Generate PIX"
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
              <p className="text-sm text-muted-foreground">Scan the QR code or copy the key below</p>
              <p className="text-2xl font-bold text-primary">R$ {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">PIX Copy & Paste</p>
              <p className="text-xs font-mono break-all text-muted-foreground/80">{pixData.pixCopiaECola.slice(0, 50)}...</p>
            </div>
            <Button 
              onClick={handleCopy}
              className="w-full h-14 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20"
              data-testid="button-copy-topup-pix"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Copy PIX Key"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
