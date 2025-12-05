import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Plus, ArrowLeftRight, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPixDeposit, getPixKeys, createPixWithdrawal, getWallets, type PixKey } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export function ActionGrid() {
  return (
    <div className="flex justify-between items-start px-2">
      <DepositButton />
      <WithdrawButton />
      <ReceiveButton />
      <ExchangeButton />
    </div>
  );
}

function DepositButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pixData, setPixData] = useState<{ pixCopiaECola: string; txid: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

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
      toast.error(t("pix.minDeposit"));
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      toast.success(t("pix.copied"));
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
        <button className="flex flex-col items-center gap-2 group" data-testid="button-deposit">
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95 text-primary bg-primary/10">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
            {t("wallet.deposit")}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">
            {pixData ? t("pix.payment") : t("pix.deposit")}
          </DialogTitle>
        </DialogHeader>
        
        {!pixData ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-base text-muted-foreground font-bold ml-1">{t("pix.amountBrl")}</label>
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
                  data-testid="input-deposit-amount"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateDeposit}
              disabled={depositMutation.isPending}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[#7c3aed] text-white text-lg font-bold"
              data-testid="button-create-deposit"
            >
              {depositMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t("pix.generateQr")
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
              <p className="text-sm text-muted-foreground">{t("pix.scanQr")}</p>
              <p className="text-2xl font-bold text-primary">R$ {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">{t("pix.copyPaste")}</p>
              <p className="text-xs font-mono break-all text-muted-foreground/80">{pixData.pixCopiaECola.slice(0, 50)}...</p>
            </div>
            <Button 
              onClick={handleCopy}
              className="w-full h-14 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20"
              data-testid="button-copy-pix"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? t("pix.copied") : t("pix.copyKey")}
            </Button>
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
      toast.success(t("pix.withdrawSuccess"));
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Withdrawal failed");
    },
  });

  const handleWithdraw = () => {
    if (!selectedKey) {
      toast.error(t("pix.selectKeyError"));
      return;
    }
    if (!amount || parseFloat(amount) < 1) {
      toast.error(t("pix.minWithdraw"));
      return;
    }
    if (parseFloat(amount) > parseFloat(brlBalance)) {
      toast.error(t("pix.insufficientBalance"));
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
        <button className="flex flex-col items-center gap-2 group" data-testid="button-withdraw">
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95 text-white bg-white/5">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
            {t("wallet.send")}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">{t("pix.withdraw")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            {t("pix.available")}: <span className="text-white font-bold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
          </div>

          {(!pixKeys || pixKeys.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("pix.noKeys")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("pix.noKeysDesc")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-base text-muted-foreground font-bold ml-1">{t("pix.selectKey")}</label>
                <div className="space-y-2">
                  {pixKeys.map((key) => (
                    <button
                      key={key.id}
                      onClick={() => setSelectedKey(key.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedKey === key.id 
                          ? "bg-primary/20 border-2 border-primary" 
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                      data-testid={`button-select-key-${key.id}`}
                    >
                      <p className="font-bold text-sm">{key.name || key.keyType.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.keyValue}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base text-muted-foreground font-bold ml-1">{t("pix.amountBrl")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max={brlBalance}
                    step="0.01"
                    className="w-full bg-background/50 border border-white/10 rounded-2xl p-5 pl-12 text-2xl focus:outline-none focus:border-primary/50 transition-all font-medium"
                    data-testid="input-withdraw-amount"
                  />
                </div>
              </div>

              <Button 
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || !selectedKey || !amount}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[#7c3aed] text-white text-lg font-bold"
                data-testid="button-confirm-withdraw"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("pix.withdrawButton")
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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"BRL" | "USDT" | "BTC">("BRL");
  const { t, language } = useLanguage();

  const walletAddresses = {
    BRL: "PIX",
    USDT: "0x1234...5678", // Placeholder - would come from user profile
    BTC: "bc1q...xyz", // Placeholder - would come from user profile
  };

  const currencyConfig = {
    BRL: { icon: "R$", color: "bg-green-500/20 text-green-400 border-green-500/20" },
    USDT: { icon: "T", color: "bg-[#26A17B]/20 text-[#26A17B] border-[#26A17B]/20" },
    BTC: { icon: "₿", color: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
  };

  const handleCopy = () => {
    if (selectedCurrency === "BRL") {
      toast.info(language === "pt-BR" ? "Use o botão Depositar para adicionar BRL via PIX" : "Use the Deposit button to add BRL via PIX");
      return;
    }
    navigator.clipboard.writeText(walletAddresses[selectedCurrency]);
    setCopied(true);
    toast.success(t("pix.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="flex flex-col items-center gap-2 group"
          data-testid="button-receive"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95 text-white bg-white/5">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
            {t("wallet.receive")}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">
            {t("wallet.receive")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-base text-muted-foreground font-bold ml-1">
              {language === "pt-BR" ? "Selecione a moeda" : "Select currency"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["BRL", "USDT", "BTC"] as const).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    selectedCurrency === currency 
                      ? "bg-primary/20 border-2 border-primary" 
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                  data-testid={`button-receive-${currency.toLowerCase()}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${currencyConfig[currency].color}`}>
                    {currencyConfig[currency].icon}
                  </div>
                  <span className="text-xs font-bold">{currency}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedCurrency === "BRL" ? (
            <div className="bg-background/50 rounded-xl p-4 space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                {language === "pt-BR" 
                  ? "Para receber BRL, use o botão Depositar para gerar um QR Code PIX"
                  : "To receive BRL, use the Deposit button to generate a PIX QR code"}
              </p>
              <Button 
                onClick={() => setOpen(false)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#7c3aed] text-white font-bold"
              >
                {language === "pt-BR" ? "Ir para Depósito" : "Go to Deposit"}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl">
                  <QRCode value={walletAddresses[selectedCurrency]} size={180} />
                </div>
              </div>
              
              <div className="bg-background/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-bold">
                  {language === "pt-BR" ? "Endereço da carteira" : "Wallet address"}
                </p>
                <p className="text-sm font-mono break-all text-muted-foreground/80">
                  {walletAddresses[selectedCurrency]}
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-xs text-yellow-400 text-center">
                  {language === "pt-BR" 
                    ? "Funcionalidade de recebimento de cripto em breve!"
                    : "Crypto receiving functionality coming soon!"}
                </p>
              </div>

              <Button 
                onClick={handleCopy}
                className="w-full h-14 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20"
                data-testid="button-copy-address"
              >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? t("pix.copied") : (language === "pt-BR" ? "Copiar Endereço" : "Copy Address")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExchangeButton() {
  const { t } = useLanguage();
  
  return (
    <button 
      className="flex flex-col items-center gap-2 group"
      onClick={() => document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" })}
      data-testid="button-exchange"
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95 text-white bg-white/5">
        <ArrowLeftRight className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
        {t("wallet.exchange")}
      </span>
    </button>
  );
}
