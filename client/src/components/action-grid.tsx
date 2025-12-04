import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Plus, ArrowLeftRight, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPixDeposit, getPixKeys, createPixWithdrawal, getWallets, verifyDeposits, type PixKey } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export function ActionGrid() {
  return (
    <div className="flex justify-between items-start px-1">
      <DepositButton />
      <WithdrawButton />
      <ReceiveButton />
      <ExchangeButton />
    </div>
  );
}

function ActionButton({ 
  icon: Icon, 
  label, 
  variant = "default",
  onClick 
}: { 
  icon: any; 
  label: string; 
  variant?: "primary" | "default";
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 group w-[72px]"
    >
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
        ${variant === "primary" 
          ? "bg-gradient-to-br from-primary/30 to-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_28px_rgba(139,92,246,0.25)] group-hover:border-primary/30" 
          : "bg-white/[0.04] text-foreground/80 border border-white/[0.06] group-hover:bg-white/[0.08] group-hover:border-white/[0.12]"
        }
        group-active:scale-95
      `}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors tracking-wide">
        {label}
      </span>
    </button>
  );
}

function DepositButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pixData, setPixData] = useState<{ pixCopiaECola: string; txid: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: createPixDeposit,
    onSuccess: (data) => {
      setPixData({ pixCopiaECola: data.pixCopiaECola, txid: data.txid });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create deposit");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyDeposits,
    onSuccess: (data) => {
      if (data.verified > 0) {
        toast.success(`${data.verified} payment(s) confirmed! Balance updated.`);
        queryClient.invalidateQueries({ queryKey: ["wallets"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        handleClose();
      } else {
        toast.info(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to verify deposits");
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
        <div data-testid="button-deposit">
          <ActionButton icon={Plus} label={t("wallet.deposit")} variant="primary" />
        </div>
      </DialogTrigger>
      <DialogContent className="premium-card border-white/[0.08] rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl font-semibold">
            {pixData ? "PIX Payment" : "Deposit via PIX"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {pixData ? "Scan QR code or copy PIX key to make payment" : "Enter amount to deposit via PIX"}
          </DialogDescription>
        </DialogHeader>
        
        {!pixData ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground font-semibold ml-1">Amount (BRL)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">R$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full premium-input p-5 pl-14 text-2xl font-medium"
                  data-testid="input-deposit-amount"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateDeposit}
              disabled={depositMutation.isPending}
              className="w-full h-14 rounded-2xl premium-button text-base"
              data-testid="button-create-deposit"
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
              <div className="bg-white p-5 rounded-2xl shadow-lg">
                <QRCode value={pixData.pixCopiaECola} size={180} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Scan the QR code or copy the key below</p>
              <p className="text-3xl font-bold text-primary font-display">R$ {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div className="bg-white/[0.04] rounded-2xl p-4 space-y-2 border border-white/[0.06]">
              <p className="text-xs text-muted-foreground font-medium">PIX Copy & Paste</p>
              <p className="text-xs font-mono break-all text-muted-foreground/70">{pixData.pixCopiaECola.slice(0, 50)}...</p>
            </div>
            <Button 
              onClick={handleCopy}
              className="w-full h-14 rounded-2xl bg-white/[0.06] text-foreground text-base font-semibold hover:bg-white/[0.1] border border-white/[0.08]"
              data-testid="button-copy-pix"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Copy PIX Key"}
            </Button>
            <Button 
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-base font-semibold hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
              data-testid="button-verify-payment"
            >
              {verifyMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              I've Paid - Verify Payment
            </Button>
            <p className="text-xs text-center text-muted-foreground/70">
              Click above after making the PIX payment to update your balance
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WithdrawButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: pixKeys } = useQuery({
    queryKey: ["pix-keys"],
    queryFn: getPixKeys,
  });

  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const brlBalance = wallets?.find(w => w.currency === "BRL")?.balance || "0";

  const withdrawMutation = useMutation({
    mutationFn: ({ pixKeyId, amount }: { pixKeyId: string; amount: string }) => 
      createPixWithdrawal(pixKeyId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Withdrawal processed successfully!");
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Withdrawal failed");
    },
  });

  const handleWithdraw = () => {
    if (!selectedKey) {
      toast.error("Please select a PIX key");
      return;
    }
    if (!amount || parseFloat(amount) < 1) {
      toast.error("Minimum withdrawal is R$ 1.00");
      return;
    }
    if (parseFloat(amount) > parseFloat(brlBalance)) {
      toast.error("Insufficient balance");
      return;
    }
    withdrawMutation.mutate({ pixKeyId: selectedKey, amount });
  };

  const handleClose = () => {
    setOpen(false);
    setAmount("");
    setSelectedKey(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <div data-testid="button-withdraw">
          <ActionButton icon={ArrowUpRight} label={t("wallet.send")} />
        </div>
      </DialogTrigger>
      <DialogContent className="premium-card border-white/[0.08] rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl font-semibold">Withdraw via PIX</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Select a PIX key and enter amount to withdraw
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Available: <span className="text-foreground font-bold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
          </div>

          {(!pixKeys || pixKeys.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No PIX keys registered</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add a key in your profile to enable withdrawals</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground font-semibold ml-1">Select PIX Key</label>
                <div className="space-y-2">
                  {pixKeys.map((key) => (
                    <button
                      key={key.id}
                      onClick={() => setSelectedKey(key.id)}
                      className={`w-full p-4 rounded-2xl text-left transition-all duration-200 ${
                        selectedKey === key.id 
                          ? "bg-primary/15 border-2 border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                          : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
                      }`}
                      data-testid={`button-select-key-${key.id}`}
                    >
                      <p className="font-semibold text-sm">{key.name || key.keyType.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{key.keyValue}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-muted-foreground font-semibold ml-1">Amount (BRL)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">R$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max={brlBalance}
                    step="0.01"
                    className="w-full premium-input p-5 pl-14 text-2xl font-medium"
                    data-testid="input-withdraw-amount"
                  />
                </div>
              </div>

              <Button 
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || !selectedKey || !amount}
                className="w-full h-14 rounded-2xl premium-button text-base"
                data-testid="button-confirm-withdraw"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Withdraw"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceiveButton() {
  const { t } = useLanguage();
  
  return (
    <div 
      onClick={() => document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" })}
      data-testid="button-receive"
    >
      <ActionButton icon={ArrowDownLeft} label={t("wallet.receive")} />
    </div>
  );
}

function ExchangeButton() {
  const { t } = useLanguage();
  
  return (
    <div 
      onClick={() => document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" })}
      data-testid="button-exchange"
    >
      <ActionButton icon={ArrowLeftRight} label="Exchange" />
    </div>
  );
}
