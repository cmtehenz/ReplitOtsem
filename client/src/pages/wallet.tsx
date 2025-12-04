import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, Plus, Send, Wallet as WalletIcon, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWallets, getRates, createPixDeposit, getPixKeys, createPixWithdrawal, verifyDeposits, type PixKey } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import QRCode from "react-qr-code";

const assetConfig: Record<string, { name: string; icon: string; color: string; bg: string; border: string }> = {
  USDT: {
    name: "Tether",
    icon: "T",
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
    border: "border-[#26A17B]/20",
  },
  BRL: {
    name: "Brazilian Real",
    icon: "R$",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
};

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  const queryClient = useQueryClient();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ pixCopiaECola: string; txid: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => getWallets(),
  });

  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: () => getRates(),
    refetchInterval: 60000,
  });

  const { data: pixKeys } = useQuery({
    queryKey: ["pix-keys"],
    queryFn: getPixKeys,
  });

  const brlBalance = wallets?.find(w => w.currency === "BRL")?.balance || "0";

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
      if (data.verified > 0 || data.reconciled > 0) {
        toast.success(isPortuguese ? "Pagamento confirmado!" : "Payment confirmed!");
        queryClient.invalidateQueries({ queryKey: ["wallets"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        handleCloseDeposit();
      } else {
        toast.info(isPortuguese ? "Nenhum pagamento encontrado ainda" : "No payment found yet");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to verify");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ pixKeyId, amount }: { pixKeyId: string; amount: string }) => 
      createPixWithdrawal(pixKeyId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(isPortuguese ? "Saque processado!" : "Withdrawal processed!");
      handleCloseWithdraw();
    },
    onError: (error: any) => {
      toast.error(error.message || "Withdrawal failed");
    },
  });

  const handleCreateDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) < 1) {
      toast.error(isPortuguese ? "Mínimo R$ 1,00" : "Minimum R$ 1.00");
      return;
    }
    depositMutation.mutate(depositAmount);
  };

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      toast.success(isPortuguese ? "Copiado!" : "Copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdraw = () => {
    if (!selectedKey) {
      toast.error(isPortuguese ? "Selecione uma chave PIX" : "Select a PIX key");
      return;
    }
    if (!withdrawAmount || parseFloat(withdrawAmount) < 1) {
      toast.error(isPortuguese ? "Mínimo R$ 1,00" : "Minimum R$ 1.00");
      return;
    }
    if (parseFloat(withdrawAmount) > parseFloat(brlBalance)) {
      toast.error(isPortuguese ? "Saldo insuficiente" : "Insufficient balance");
      return;
    }
    withdrawMutation.mutate({ pixKeyId: selectedKey, amount: withdrawAmount });
  };

  const handleCloseDeposit = () => {
    setDepositOpen(false);
    setDepositAmount("");
    setPixData(null);
  };

  const handleCloseWithdraw = () => {
    setWithdrawOpen(false);
    setWithdrawAmount("");
    setSelectedKey(null);
  };

  const calculateTotalBalance = () => {
    if (!wallets) return null;
    
    const usdtRate = rates?.usdtBrl?.sell;
    
    let total = 0;
    let hasUnknownRate = false;
    
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT" && usdtRate) {
        total += balance * usdtRate;
      } else if (wallet.currency === "USDT" && !usdtRate && balance > 0) {
        hasUnknownRate = true;
      } else if (wallet.currency === "BTC" && balance > 0) {
        hasUnknownRate = true;
      }
    });
    
    if (hasUnknownRate && total === 0) {
      return null;
    }
    
    return total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getValueInBrl = (balance: string, currency: string) => {
    const amount = parseFloat(balance);
    const usdtRate = rates?.usdtBrl?.sell;
    
    if (currency === "BRL") {
      return `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === "USDT" && usdtRate) {
      const value = amount * usdtRate;
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return "—";
  };

  const totalBalance = calculateTotalBalance();

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">
          {isPortuguese ? "Carteira" : "Wallet"}
        </h1>

        <div className="premium-card rounded-3xl p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground/70 font-medium">
              {isPortuguese ? "Saldo Total" : "Total Balance"}
            </p>
            <h2 className="text-3xl font-bold font-display tracking-tight mt-1">
              {totalBalance ? `R$ ${totalBalance}` : "—"}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button 
              onClick={() => setDepositOpen(true)}
              className="bg-gradient-to-br from-primary to-[#7c3aed] text-white hover:from-primary hover:to-[#6d28d9] border border-primary/40 h-12 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all active:scale-[0.98]"
              data-testid="button-wallet-deposit"
            >
              <Plus className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Depositar" : "Deposit"}
            </Button>
            <Button 
              onClick={() => setWithdrawOpen(true)}
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              data-testid="button-wallet-send"
            >
              <Send className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Enviar" : "Send"}
            </Button>
            <Button 
              onClick={() => {
                const exchangeSection = document.getElementById("exchange-section");
                if (exchangeSection) {
                  setLocation("/");
                  setTimeout(() => {
                    document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                } else {
                  setLocation("/");
                }
              }}
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              data-testid="button-wallet-receive"
            >
              <ArrowDownLeft className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Trocar" : "Exchange"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-medium text-lg tracking-tight">
            {isPortuguese ? "Seus Ativos" : "Your Assets"}
          </h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06]" />
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-white/[0.06] rounded" />
                      <div className="h-3 w-14 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-24 bg-white/[0.06] rounded" />
                </div>
              ))}
            </div>
          ) : !wallets?.length ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">
                {isPortuguese ? "Nenhum ativo ainda" : "No assets yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet, i) => {
                const config = assetConfig[wallet.currency];
                const balance = parseFloat(wallet.balance);
                const formattedBalance = wallet.currency === "BRL"
                  ? balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                  : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 });

                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="premium-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
                    onClick={() => setLocation("/activity")}
                    data-testid={`wallet-asset-${wallet.currency}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border",
                        config.bg, config.color, config.border
                      )}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{config.name}</p>
                        <p className="text-xs text-muted-foreground/60 font-medium">
                          {formattedBalance} {wallet.currency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {getValueInBrl(wallet.balance, wallet.currency)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={depositOpen} onOpenChange={(open) => { if (!open) handleCloseDeposit(); else setDepositOpen(true); }}>
        <DialogContent className="premium-card border-white/[0.08] rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-2xl font-semibold">
              {pixData ? "PIX Payment" : (isPortuguese ? "Depositar via PIX" : "Deposit via PIX")}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {pixData 
                ? (isPortuguese ? "Escaneie o QR code ou copie a chave PIX" : "Scan QR code or copy PIX key")
                : (isPortuguese ? "Insira o valor para depositar via PIX" : "Enter amount to deposit via PIX")}
            </DialogDescription>
          </DialogHeader>
          
          {!pixData ? (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground font-semibold ml-1">
                  {isPortuguese ? "Valor (BRL)" : "Amount (BRL)"}
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">R$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="w-full premium-input p-5 pl-14 text-2xl font-medium"
                    data-testid="input-wallet-deposit-amount"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateDeposit}
                disabled={depositMutation.isPending}
                className="w-full h-14 rounded-2xl premium-button text-base"
                data-testid="button-generate-pix"
              >
                {depositMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isPortuguese ? "Gerar PIX" : "Generate PIX"
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
                <p className="text-sm text-muted-foreground">
                  {isPortuguese ? "Escaneie o QR code ou copie a chave" : "Scan QR code or copy the key"}
                </p>
                <p className="text-3xl font-bold text-primary font-display">R$ {parseFloat(depositAmount).toFixed(2)}</p>
              </div>
              <Button 
                onClick={handleCopy}
                className="w-full h-14 rounded-2xl bg-white/[0.06] text-foreground text-base font-semibold hover:bg-white/[0.1] border border-white/[0.08]"
                data-testid="button-copy-pix-wallet"
              >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? (isPortuguese ? "Copiado!" : "Copied!") : (isPortuguese ? "Copiar Chave PIX" : "Copy PIX Key")}
              </Button>
              <Button 
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-base font-semibold hover:from-emerald-500 hover:to-emerald-400"
                data-testid="button-verify-wallet"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2" />
                )}
                {isPortuguese ? "Já Paguei - Verificar" : "I've Paid - Verify"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={(open) => { if (!open) handleCloseWithdraw(); else setWithdrawOpen(true); }}>
        <DialogContent className="premium-card border-white/[0.08] rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-2xl font-semibold">
              {isPortuguese ? "Sacar via PIX" : "Withdraw via PIX"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {isPortuguese ? "Selecione uma chave PIX e o valor" : "Select a PIX key and enter amount"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center text-sm text-muted-foreground">
              {isPortuguese ? "Disponível:" : "Available:"} <span className="text-foreground font-bold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
            </div>

            {(!pixKeys || pixKeys.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{isPortuguese ? "Nenhuma chave PIX cadastrada" : "No PIX keys registered"}</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-primary"
                  onClick={() => { handleCloseWithdraw(); setLocation("/pix-keys"); }}
                >
                  {isPortuguese ? "Adicionar chave PIX" : "Add PIX key"}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground font-semibold ml-1">
                    {isPortuguese ? "Selecione a Chave PIX" : "Select PIX Key"}
                  </label>
                  <div className="space-y-2">
                    {pixKeys.map((key) => (
                      <button
                        key={key.id}
                        onClick={() => setSelectedKey(key.id)}
                        className={`w-full p-4 rounded-2xl text-left transition-all duration-200 ${
                          selectedKey === key.id 
                            ? "bg-primary/15 border-2 border-primary/50" 
                            : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
                        }`}
                        data-testid={`select-key-${key.id}`}
                      >
                        <p className="font-semibold text-sm">{key.name || key.keyType.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{key.keyValue}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground font-semibold ml-1">
                    {isPortuguese ? "Valor (BRL)" : "Amount (BRL)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">R$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1"
                      max={brlBalance}
                      step="0.01"
                      className="w-full premium-input p-5 pl-14 text-2xl font-medium"
                      data-testid="input-wallet-withdraw-amount"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !selectedKey || !withdrawAmount}
                  className="w-full h-14 rounded-2xl premium-button text-base"
                  data-testid="button-confirm-wallet-withdraw"
                >
                  {withdrawMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isPortuguese ? "Sacar" : "Withdraw"
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav active="wallet" />
    </div>
  );
}
