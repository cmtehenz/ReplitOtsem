import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Plus, ArrowLeftRight, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPixDeposit, getPixKeys, createPixWithdrawal, getWallets, verifyDeposits, type PixKey } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export function ActionGrid() {
  return (
    <div className="flex justify-between items-start">
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
      className="flex flex-col items-center gap-2 w-[72px]"
    >
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
        ${variant === "primary" 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      `}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-gray-600">
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
        toast.success(`${data.verified} payment(s) confirmed!`);
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
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAmount("");
    setPixData(null);
  };

  return (
    <>
      <div data-testid="button-deposit" onClick={() => setOpen(true)}>
        <ActionButton icon={Plus} label={t("wallet.deposit")} variant="primary" />
      </div>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true); }}>
        <DialogContent className="bg-white border-0 rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              {pixData ? "PIX Payment" : "Deposit via PIX"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              {pixData ? "Scan QR code or copy PIX key" : "Enter the amount to deposit"}
            </DialogDescription>
          </DialogHeader>
          
          {!pixData ? (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount (BRL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="w-full h-14 pl-12 pr-4 text-xl font-medium border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    data-testid="input-deposit-amount"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateDeposit}
                disabled={depositMutation.isPending}
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
                data-testid="button-create-deposit"
              >
                {depositMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate PIX"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl border border-gray-100">
                  <QRCode value={pixData.pixCopiaECola} size={180} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">R$ {parseFloat(amount).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">PIX Copy & Paste</p>
                <p className="text-xs font-mono text-gray-600 break-all">{pixData.pixCopiaECola.slice(0, 50)}...</p>
              </div>
              <Button 
                onClick={handleCopy}
                variant="outline"
                className="w-full h-12 rounded-xl border-gray-200 font-medium"
                data-testid="button-copy-pix"
              >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? "Copied!" : "Copy PIX Key"}
              </Button>
              <Button 
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium"
                data-testid="button-verify-payment"
              >
                {verifyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                Verify Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
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
      toast.success("Withdrawal processed!");
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
    <>
      <div data-testid="button-withdraw" onClick={() => setOpen(true)}>
        <ActionButton icon={ArrowUpRight} label={t("wallet.send")} />
      </div>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true); }}>
        <DialogContent className="bg-white border-0 rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">Withdraw via PIX</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              Select a PIX key and enter amount
            </DialogDescription>
          </DialogHeader>
        
          <div className="space-y-6 pt-4">
            <div className="text-center text-sm text-gray-500">
              Available: <span className="text-gray-900 font-semibold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
            </div>

            {(!pixKeys || pixKeys.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No PIX keys registered</p>
                <p className="text-xs text-gray-400 mt-1">Add a key in your profile</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select PIX Key</label>
                  <div className="space-y-2">
                    {pixKeys.map((key) => (
                      <button
                        key={key.id}
                        onClick={() => setSelectedKey(key.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          selectedKey === key.id 
                            ? "bg-primary/5 border-2 border-primary" 
                            : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                        }`}
                        data-testid={`button-select-key-${key.id}`}
                      >
                        <p className="font-medium text-sm text-gray-900">{key.name || key.keyType.toUpperCase()}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{key.keyValue}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Amount (BRL)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={brlBalance}
                      step="0.01"
                      className="w-full h-14 pl-12 pr-4 text-xl font-medium border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      data-testid="input-withdraw-amount"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !selectedKey || !amount}
                  className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
                  data-testid="button-confirm-withdraw"
                >
                  {withdrawMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Withdraw"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
  return (
    <div 
      onClick={() => document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" })}
      data-testid="button-exchange"
    >
      <ActionButton icon={ArrowLeftRight} label="Exchange" />
    </div>
  );
}
