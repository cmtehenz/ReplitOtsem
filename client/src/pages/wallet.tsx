import { useState } from "react";
import { ArrowDownLeft, Plus, Send, Wallet as WalletIcon, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWallets, getRates, createPixDeposit, getPixKeys, createPixWithdrawal, verifyDeposits } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import QRCode from "react-qr-code";

const assetConfig: Record<string, { name: string; icon: string; color: string; bg: string }> = {
  USDT: {
    name: "Tether",
    icon: "T",
    color: "text-[#26A17B]",
    bg: "bg-[#26A17B]/10",
  },
  BRL: {
    name: "Brazilian Real",
    icon: "R$",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-500",
    bg: "bg-orange-50",
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
    const usdtRate = rates?.usdtBrl?.sell || 6.0;
    let total = 0;
    
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * usdtRate;
      }
    });
    
    return total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getValueInBrl = (balance: string, currency: string) => {
    const amount = parseFloat(balance);
    const usdtRate = rates?.usdtBrl?.sell || 6.0;
    
    if (currency === "BRL") {
      return `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    } else if (currency === "USDT") {
      const value = amount * usdtRate;
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }
    return "—";
  };

  const totalBalance = calculateTotalBalance();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isPortuguese ? "Carteira" : "Wallet"}
        </h1>

        <div className="bg-white rounded-2xl p-6 card-shadow space-y-6">
          <div>
            <p className="text-sm text-gray-500">
              {isPortuguese ? "Saldo Total" : "Total Balance"}
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 mt-1">
              {totalBalance ? `R$ ${totalBalance}` : "—"}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button 
              onClick={() => setDepositOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-medium"
              data-testid="button-wallet-deposit"
            >
              <Plus className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Depositar" : "Deposit"}
            </Button>
            <Button 
              onClick={() => setWithdrawOpen(true)}
              variant="outline"
              className="h-12 rounded-xl font-medium"
              data-testid="button-wallet-send"
            >
              <Send className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Enviar" : "Send"}
            </Button>
            <Button 
              onClick={() => {
                setLocation("/");
                setTimeout(() => {
                  document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              variant="outline"
              className="h-12 rounded-xl font-medium"
              data-testid="button-wallet-receive"
            >
              <ArrowDownLeft className="w-4 h-4 mr-1" /> 
              {isPortuguese ? "Trocar" : "Exchange"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {isPortuguese ? "Seus Ativos" : "Your Assets"}
          </h3>
          
          {isLoading ? (
            <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-14 bg-gray-50 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !wallets?.length ? (
            <div className="bg-white rounded-2xl card-shadow p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {isPortuguese ? "Nenhum ativo ainda" : "No assets yet"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
              {wallets.map((wallet) => {
                const config = assetConfig[wallet.currency];
                const balance = parseFloat(wallet.balance);
                const formattedBalance = wallet.currency === "BRL"
                  ? balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                  : balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: wallet.currency === "BTC" ? 8 : 2 });

                return (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setLocation("/activity")}
                    data-testid={`wallet-asset-${wallet.currency}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${config.bg} ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{config.name}</p>
                        <p className="text-sm text-gray-500">
                          {formattedBalance} {wallet.currency}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {getValueInBrl(wallet.balance, wallet.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={depositOpen} onOpenChange={(open) => { if (!open) handleCloseDeposit(); else setDepositOpen(true); }}>
        <DialogContent className="bg-white border-0 rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              {pixData ? "PIX Payment" : (isPortuguese ? "Depositar via PIX" : "Deposit via PIX")}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              {pixData 
                ? (isPortuguese ? "Escaneie o QR code ou copie a chave PIX" : "Scan QR code or copy PIX key")
                : (isPortuguese ? "Insira o valor para depositar via PIX" : "Enter amount to deposit via PIX")}
            </DialogDescription>
          </DialogHeader>
          
          {!pixData ? (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isPortuguese ? "Valor (BRL)" : "Amount (BRL)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="w-full h-14 pl-12 pr-4 text-xl font-medium border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    data-testid="input-wallet-deposit-amount"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateDeposit}
                disabled={depositMutation.isPending}
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
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
            <div className="space-y-6 pt-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl border border-gray-100">
                  <QRCode value={pixData.pixCopiaECola} size={180} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">R$ {parseFloat(depositAmount).toFixed(2)}</p>
              </div>
              <Button 
                onClick={handleCopy}
                variant="outline"
                className="w-full h-12 rounded-xl font-medium"
                data-testid="button-copy-pix-wallet"
              >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? (isPortuguese ? "Copiado!" : "Copied!") : (isPortuguese ? "Copiar Chave PIX" : "Copy PIX Key")}
              </Button>
              <Button 
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium"
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
        <DialogContent className="bg-white border-0 rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              {isPortuguese ? "Sacar via PIX" : "Withdraw via PIX"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              {isPortuguese ? "Selecione uma chave PIX e o valor" : "Select a PIX key and enter amount"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <div className="text-center text-sm text-gray-500">
              {isPortuguese ? "Disponível:" : "Available:"} <span className="text-gray-900 font-semibold">R$ {parseFloat(brlBalance).toFixed(2)}</span>
            </div>

            {(!pixKeys || pixKeys.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{isPortuguese ? "Nenhuma chave PIX cadastrada" : "No PIX keys registered"}</p>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {isPortuguese ? "Selecione a Chave PIX" : "Select PIX Key"}
                  </label>
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
                        data-testid={`select-key-${key.id}`}
                      >
                        <p className="font-medium text-gray-900">{key.name || key.keyType.toUpperCase()}</p>
                        <p className="text-sm text-gray-500 font-mono mt-1">{key.keyValue}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {isPortuguese ? "Valor (BRL)" : "Amount (BRL)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1"
                      max={brlBalance}
                      step="0.01"
                      className="w-full h-14 pl-12 pr-4 text-xl font-medium border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      data-testid="input-wallet-withdraw-amount"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !selectedKey || !withdrawAmount}
                  className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
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
