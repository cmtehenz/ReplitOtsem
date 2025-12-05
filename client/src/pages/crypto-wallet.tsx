import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Copy, Check, Eye, EyeOff, Shield, Key, Wallet, AlertTriangle, Download, ChevronRight, RefreshCw, Send, QrCode, ArrowUpRight, ExternalLink, X, Loader2, History, BookUser, Plus, Trash2, ArrowDownLeft, ArrowUpRightFromCircle, Fuel } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getCryptoWallet, createCryptoWallet, confirmWalletBackup, importCryptoWallet, getCryptoBalances, getSupportedNetworks, validateCryptoAddress, estimateCryptoGas, sendCryptoUsdt, getNativeBalances, getCryptoTransactions, getAddressBook, addAddressBookEntry, deleteAddressBookEntry, type CryptoWallet, type CryptoBalances, type NetworkInfo, type GasEstimate, type SendTransactionResult, type NativeBalances, type CryptoTransaction, type AddressBookEntry } from "../lib/api";
import { toast } from "sonner";
import QRCode from "react-qr-code";

type Step = "initial" | "create-password" | "show-seed" | "verify-seed" | "import" | "complete";
type SendStep = "form" | "confirm" | "sending" | "success";

export default function CryptoWalletPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);
  const [balances, setBalances] = useState<CryptoBalances | null>(null);
  const [networks, setNetworks] = useState<Record<string, NetworkInfo>>({});
  const [step, setStep] = useState<Step>("initial");
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [verifyWords, setVerifyWords] = useState<{ index: number; word: string }[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>(["", "", ""]);
  const [importMnemonic, setImportMnemonic] = useState("");
  const [importPassword, setImportPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [refreshingBalances, setRefreshingBalances] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState<SendStep>("form");
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNetwork, setSendNetwork] = useState("ethereum");
  const [sendPassword, setSendPassword] = useState("");
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [estimatingGas, setEstimatingGas] = useState(false);
  const [sendResult, setSendResult] = useState<SendTransactionResult | null>(null);
  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [nativeBalances, setNativeBalances] = useState<NativeBalances | null>(null);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [activeTab, setActiveTab] = useState<"balances" | "history">("balances");

  const t: Record<string, {
    title: string;
    subtitle: string;
    createWallet: string;
    importWallet: string;
    createDescription: string;
    importDescription: string;
    enterPassword: string;
    passwordInfo: string;
    continue: string;
    yourRecoveryPhrase: string;
    recoveryWarning: string;
    showPhrase: string;
    hidePhrase: string;
    copyPhrase: string;
    copied: string;
    iHaveBackedUp: string;
    verifyBackup: string;
    verifyDescription: string;
    word: string;
    verify: string;
    importTitle: string;
    enterRecoveryPhrase: string;
    enterPasswordImport: string;
    import: string;
    walletReady: string;
    evmAddress: string;
    tronAddress: string;
    yourAddresses: string;
    receiveUsdt: string;
    balance: string;
    refreshBalances: string;
    backupNotice: string;
    backupNoticeDesc: string;
    backupNow: string;
    networks: string;
    noWallet: string;
    createOrImport: string;
    send: string;
    receive: string;
    recipientAddress: string;
    amount: string;
    selectNetwork: string;
    estimatedFee: string;
    confirmSend: string;
    sending: string;
    transactionSuccess: string;
    viewOnExplorer: string;
    invalidAddress: string;
    confirmWithPassword: string;
    done: string;
    scanToReceive: string;
    copyAddress: string;
    close: string;
    history: string;
    noTransactions: string;
    sent: string;
    received: string;
    addressBook: string;
    noSavedAddresses: string;
    addContact: string;
    contactName: string;
    saveContact: string;
    cancel: string;
    gasBalance: string;
    balances: string;
  }> = {
    en: {
      title: "Crypto Wallet",
      subtitle: "Your non-custodial blockchain wallet",
      createWallet: "Create New Wallet",
      importWallet: "Import Existing Wallet",
      createDescription: "Generate a new 12-word recovery phrase for your wallet",
      importDescription: "Restore your wallet using an existing recovery phrase",
      enterPassword: "Enter Password",
      passwordInfo: "Your password encrypts your recovery phrase. You'll need it to sign transactions.",
      continue: "Continue",
      yourRecoveryPhrase: "Your Recovery Phrase",
      recoveryWarning: "Write down these 12 words in order and store them safely. Anyone with access to this phrase can access your funds.",
      showPhrase: "Show Phrase",
      hidePhrase: "Hide Phrase",
      copyPhrase: "Copy to Clipboard",
      copied: "Copied!",
      iHaveBackedUp: "I've Backed Up My Recovery Phrase",
      verifyBackup: "Verify Your Backup",
      verifyDescription: "Enter the requested words to confirm you've saved your recovery phrase",
      word: "Word",
      verify: "Verify & Complete",
      importTitle: "Import Wallet",
      enterRecoveryPhrase: "Enter your 12-word recovery phrase",
      enterPasswordImport: "Enter your account password to encrypt the wallet",
      import: "Import Wallet",
      walletReady: "Wallet Ready",
      evmAddress: "EVM Address (Ethereum, Polygon, BSC, etc.)",
      tronAddress: "Tron Address",
      yourAddresses: "Your Wallet Addresses",
      receiveUsdt: "Receive USDT",
      balance: "Balance",
      refreshBalances: "Refresh Balances",
      backupNotice: "Backup Required",
      backupNoticeDesc: "Please backup your recovery phrase to secure your funds",
      backupNow: "Backup Now",
      networks: "Supported Networks",
      noWallet: "No wallet yet",
      createOrImport: "Create a new wallet or import an existing one to get started",
      send: "Send",
      receive: "Receive",
      recipientAddress: "Recipient Address",
      amount: "Amount (USDT)",
      selectNetwork: "Select Network",
      estimatedFee: "Estimated Fee",
      confirmSend: "Confirm & Send",
      sending: "Sending...",
      transactionSuccess: "Transaction Successful!",
      viewOnExplorer: "View on Explorer",
      invalidAddress: "Invalid address",
      confirmWithPassword: "Enter your password to confirm",
      done: "Done",
      scanToReceive: "Scan to receive USDT",
      copyAddress: "Copy Address",
      close: "Close",
      history: "Transaction History",
      noTransactions: "No transactions yet",
      sent: "Sent",
      received: "Received",
      addressBook: "Address Book",
      noSavedAddresses: "No saved addresses",
      addContact: "Add Contact",
      contactName: "Contact Name",
      saveContact: "Save Contact",
      cancel: "Cancel",
      gasBalance: "Gas Balance",
      balances: "Balances",
    },
    "pt-BR": {
      title: "Carteira Crypto",
      subtitle: "Sua carteira blockchain não-custodial",
      createWallet: "Criar Nova Carteira",
      importWallet: "Importar Carteira",
      createDescription: "Gere uma nova frase de recuperação de 12 palavras",
      importDescription: "Restaure sua carteira usando uma frase de recuperação existente",
      enterPassword: "Digite sua Senha",
      passwordInfo: "Sua senha criptografa sua frase de recuperação. Você precisará dela para assinar transações.",
      continue: "Continuar",
      yourRecoveryPhrase: "Sua Frase de Recuperação",
      recoveryWarning: "Anote estas 12 palavras em ordem e guarde-as com segurança. Qualquer pessoa com acesso a esta frase pode acessar seus fundos.",
      showPhrase: "Mostrar Frase",
      hidePhrase: "Ocultar Frase",
      copyPhrase: "Copiar",
      copied: "Copiado!",
      iHaveBackedUp: "Salvei Minha Frase de Recuperação",
      verifyBackup: "Verifique Seu Backup",
      verifyDescription: "Digite as palavras solicitadas para confirmar que você salvou sua frase",
      word: "Palavra",
      verify: "Verificar e Concluir",
      importTitle: "Importar Carteira",
      enterRecoveryPhrase: "Digite sua frase de recuperação de 12 palavras",
      enterPasswordImport: "Digite sua senha da conta para criptografar a carteira",
      import: "Importar Carteira",
      walletReady: "Carteira Pronta",
      evmAddress: "Endereço EVM (Ethereum, Polygon, BSC, etc.)",
      tronAddress: "Endereço Tron",
      yourAddresses: "Seus Endereços",
      receiveUsdt: "Receber USDT",
      balance: "Saldo",
      refreshBalances: "Atualizar Saldos",
      backupNotice: "Backup Necessário",
      backupNoticeDesc: "Por favor, faça backup da sua frase de recuperação para proteger seus fundos",
      backupNow: "Fazer Backup",
      networks: "Redes Suportadas",
      noWallet: "Nenhuma carteira ainda",
      createOrImport: "Crie uma nova carteira ou importe uma existente para começar",
      send: "Enviar",
      receive: "Receber",
      recipientAddress: "Endereço do Destinatário",
      amount: "Valor (USDT)",
      selectNetwork: "Selecione a Rede",
      estimatedFee: "Taxa Estimada",
      confirmSend: "Confirmar e Enviar",
      sending: "Enviando...",
      transactionSuccess: "Transação Concluída!",
      viewOnExplorer: "Ver no Explorer",
      invalidAddress: "Endereço inválido",
      confirmWithPassword: "Digite sua senha para confirmar",
      done: "Concluído",
      scanToReceive: "Escaneie para receber USDT",
      copyAddress: "Copiar Endereço",
      close: "Fechar",
      history: "Histórico de Transações",
      noTransactions: "Nenhuma transação ainda",
      sent: "Enviado",
      received: "Recebido",
      addressBook: "Agenda de Endereços",
      noSavedAddresses: "Nenhum endereço salvo",
      addContact: "Adicionar Contato",
      contactName: "Nome do Contato",
      saveContact: "Salvar Contato",
      cancel: "Cancelar",
      gasBalance: "Saldo de Gas",
      balances: "Saldos",
    },
  };
  const text = t[language];

  useEffect(() => {
    loadWallet();
    loadNetworks();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const w = await getCryptoWallet();
      setWallet(w);
      if (w) {
        setStep("complete");
        loadAllData();
      }
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    loadBalances();
    loadNativeBalances();
    loadTransactions();
    loadAddressBook();
  };

  const loadBalances = async () => {
    try {
      setRefreshingBalances(true);
      const b = await getCryptoBalances();
      setBalances(b);
    } catch (error) {
      console.error("Failed to load balances:", error);
    } finally {
      setRefreshingBalances(false);
    }
  };

  const loadNativeBalances = async () => {
    try {
      const nb = await getNativeBalances();
      setNativeBalances(nb);
    } catch (error) {
      console.error("Failed to load native balances:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const txs = await getCryptoTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const loadAddressBook = async () => {
    try {
      const book = await getAddressBook();
      setAddressBook(book);
    } catch (error) {
      console.error("Failed to load address book:", error);
    }
  };

  const handleAddContact = async () => {
    if (!newContactName.trim() || !sendAddress.trim()) {
      toast.error("Please enter a name and address");
      return;
    }
    
    try {
      await addAddressBookEntry(newContactName, sendAddress, sendNetwork);
      toast.success("Contact saved!");
      setShowAddContact(false);
      setNewContactName("");
      loadAddressBook();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteAddressBookEntry(id);
      loadAddressBook();
      toast.success("Contact deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const selectContact = (entry: AddressBookEntry) => {
    setSendAddress(entry.address);
    setSendNetwork(entry.network);
    setShowAddressBook(false);
    setAddressValid(true);
  };

  const loadNetworks = async () => {
    try {
      const n = await getSupportedNetworks();
      setNetworks(n);
    } catch (error) {
      console.error("Failed to load networks:", error);
    }
  };

  const handleCreateWallet = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    
    try {
      setProcessing(true);
      const result = await createCryptoWallet(password);
      setMnemonic(result.mnemonic.split(" "));
      setWallet({
        evmAddress: result.evmAddress,
        tronAddress: result.tronAddress,
        seedBackedUp: false,
        createdAt: new Date().toISOString(),
      });
      setStep("show-seed");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyMnemonic = async () => {
    await navigator.clipboard.writeText(mnemonic.join(" "));
    setCopiedMnemonic(true);
    toast.success(text.copied);
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  const handleBackedUp = () => {
    const indices = [];
    const usedIndices = new Set<number>();
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * 12);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        indices.push(randomIndex);
      }
    }
    indices.sort((a, b) => a - b);
    setVerifyWords(indices.map(i => ({ index: i, word: mnemonic[i] })));
    setUserInputs(["", "", ""]);
    setStep("verify-seed");
  };

  const handleVerify = async () => {
    const isCorrect = verifyWords.every((vw, i) => 
      userInputs[i].toLowerCase().trim() === vw.word.toLowerCase()
    );
    
    if (!isCorrect) {
      toast.error("Incorrect words. Please check your backup and try again.");
      return;
    }
    
    try {
      setProcessing(true);
      await confirmWalletBackup();
      setWallet(prev => prev ? { ...prev, seedBackedUp: true } : null);
      setMnemonic([]);
      setStep("complete");
      toast.success("Wallet backup confirmed!");
      loadBalances();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importMnemonic.trim()) {
      toast.error("Please enter your recovery phrase");
      return;
    }
    if (!importPassword) {
      toast.error("Please enter your password");
      return;
    }
    
    const words = importMnemonic.trim().split(/\s+/);
    if (words.length !== 12) {
      toast.error("Recovery phrase must be exactly 12 words");
      return;
    }
    
    try {
      setProcessing(true);
      const result = await importCryptoWallet(importMnemonic.trim(), importPassword);
      setWallet({
        evmAddress: result.evmAddress,
        tronAddress: result.tronAddress,
        seedBackedUp: true,
        createdAt: new Date().toISOString(),
      });
      setStep("complete");
      toast.success("Wallet imported successfully!");
      loadBalances();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyAddress = async (address: string, type: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(type);
    toast.success("Address copied!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return "0.00";
    const num = parseFloat(balance);
    return num.toFixed(6);
  };

  const openSendModal = () => {
    setSendStep("form");
    setSendAddress("");
    setSendAmount("");
    setSendPassword("");
    setGasEstimate(null);
    setSendResult(null);
    setAddressValid(null);
    setShowSendModal(true);
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSendStep("form");
  };

  const handleAddressChange = async (address: string) => {
    setSendAddress(address);
    setAddressValid(null);
    
    if (address.length > 10) {
      try {
        setValidatingAddress(true);
        const result = await validateCryptoAddress(address, sendNetwork);
        setAddressValid(result.valid);
      } catch {
        setAddressValid(false);
      } finally {
        setValidatingAddress(false);
      }
    }
  };

  const handleEstimateGas = async () => {
    if (!sendAddress || !sendAmount || !addressValid) return;
    
    try {
      setEstimatingGas(true);
      const estimate = await estimateCryptoGas(sendAddress, sendAmount, sendNetwork);
      setGasEstimate(estimate);
      setSendStep("confirm");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEstimatingGas(false);
    }
  };

  const handleSendUsdt = async () => {
    if (!sendPassword) {
      toast.error("Please enter your password");
      return;
    }
    
    try {
      setSendStep("sending");
      const result = await sendCryptoUsdt(sendAddress, sendAmount, sendNetwork, sendPassword);
      if (result.success) {
        setSendResult(result);
        setSendStep("success");
        loadBalances();
      }
    } catch (error: any) {
      toast.error(error.message);
      setSendStep("confirm");
    }
  };

  const getAddressForNetwork = (networkKey: string) => {
    if (!wallet) return "";
    const network = networks[networkKey];
    if (!network) return wallet.evmAddress;
    return network.type === "tron" ? wallet.tronAddress : wallet.evmAddress;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{text.title}</h1>
            <p className="text-sm text-muted-foreground">{text.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {step === "initial" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{text.noWallet}</h2>
              <p className="text-muted-foreground mt-2">{text.createOrImport}</p>
            </div>

            <button
              onClick={() => setStep("create-password")}
              className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 hover:bg-card/80 transition-colors"
              data-testid="button-create-wallet"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{text.createWallet}</h3>
                <p className="text-sm text-muted-foreground">{text.createDescription}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setStep("import")}
              className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 hover:bg-card/80 transition-colors"
              data-testid="button-import-wallet"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{text.importWallet}</h3>
                <p className="text-sm text-muted-foreground">{text.importDescription}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {step === "create-password" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{text.enterPassword}</h2>
              <p className="text-muted-foreground mt-2">{text.passwordInfo}</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your account password"
                className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                data-testid="input-password"
              />

              <button
                onClick={handleCreateWallet}
                disabled={!password || processing}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
                data-testid="button-continue"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  text.continue
                )}
              </button>
            </div>
          </div>
        )}

        {step === "show-seed" && (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{text.recoveryWarning}</p>
            </div>

            <div className="text-center py-2">
              <h2 className="text-xl font-bold">{text.yourRecoveryPhrase}</h2>
            </div>

            <div className="relative">
              <div className={`grid grid-cols-3 gap-2 ${!showMnemonic ? 'blur-lg' : ''}`}>
                {mnemonic.map((word, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg p-2 text-center"
                    data-testid={`seed-word-${i}`}
                  >
                    <span className="text-xs text-muted-foreground">{i + 1}.</span>{" "}
                    <span className="font-mono">{word}</span>
                  </div>
                ))}
              </div>

              {!showMnemonic && (
                <button
                  onClick={() => setShowMnemonic(true)}
                  className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl"
                  data-testid="button-show-phrase"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Eye className="w-5 h-5" />
                    <span>{text.showPhrase}</span>
                  </div>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="flex-1 h-10 bg-card rounded-xl flex items-center justify-center gap-2"
                data-testid="button-toggle-phrase"
              >
                {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showMnemonic ? text.hidePhrase : text.showPhrase}
              </button>
              <button
                onClick={handleCopyMnemonic}
                className="flex-1 h-10 bg-card rounded-xl flex items-center justify-center gap-2"
                data-testid="button-copy-phrase"
              >
                {copiedMnemonic ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copiedMnemonic ? text.copied : text.copyPhrase}
              </button>
            </div>

            <button
              onClick={handleBackedUp}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold"
              data-testid="button-backed-up"
            >
              {text.iHaveBackedUp}
            </button>
          </div>
        )}

        {step === "verify-seed" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold">{text.verifyBackup}</h2>
              <p className="text-muted-foreground mt-2">{text.verifyDescription}</p>
            </div>

            <div className="space-y-4">
              {verifyWords.map((vw, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    {text.word} #{vw.index + 1}
                  </label>
                  <input
                    type="text"
                    value={userInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...userInputs];
                      newInputs[i] = e.target.value;
                      setUserInputs(newInputs);
                    }}
                    placeholder={`Enter word ${vw.index + 1}`}
                    className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                    data-testid={`input-verify-word-${i}`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={userInputs.some(u => !u.trim()) || processing}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
              data-testid="button-verify"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                text.verify
              )}
            </button>
          </div>
        )}

        {step === "import" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold">{text.importTitle}</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{text.enterRecoveryPhrase}</label>
                <textarea
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                  placeholder="word1 word2 word3 ..."
                  rows={3}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm resize-none"
                  data-testid="input-import-mnemonic"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{text.enterPasswordImport}</label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Your account password"
                  className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  data-testid="input-import-password"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={!importMnemonic.trim() || !importPassword || processing}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
                data-testid="button-import"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing...
                  </span>
                ) : (
                  text.import
                )}
              </button>

              <button
                onClick={() => setStep("initial")}
                className="w-full h-10 text-muted-foreground"
                data-testid="button-back-import"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === "complete" && wallet && (
          <div className="space-y-6">
            {!wallet.seedBackedUp && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-400">{text.backupNotice}</h4>
                  <p className="text-sm text-amber-300/80 mt-1">{text.backupNoticeDesc}</p>
                  <button
                    onClick={() => setStep("show-seed")}
                    className="mt-2 text-sm text-amber-400 font-semibold"
                    data-testid="button-backup-now"
                  >
                    {text.backupNow} →
                  </button>
                </div>
              </div>
            )}

            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">{text.walletReady}</h2>
            </div>

            <div className="bg-card rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold">{text.yourAddresses}</h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{text.evmAddress}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background rounded-lg p-2 overflow-hidden text-ellipsis">
                      {wallet.evmAddress}
                    </code>
                    <button
                      onClick={() => copyAddress(wallet.evmAddress, "evm")}
                      className="w-8 h-8 rounded-lg bg-background flex items-center justify-center"
                      data-testid="button-copy-evm"
                    >
                      {copiedAddress === "evm" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{text.tronAddress}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background rounded-lg p-2 overflow-hidden text-ellipsis">
                      {wallet.tronAddress}
                    </code>
                    <button
                      onClick={() => copyAddress(wallet.tronAddress, "tron")}
                      className="w-8 h-8 rounded-lg bg-background flex items-center justify-center"
                      data-testid="button-copy-tron"
                    >
                      {copiedAddress === "tron" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowReceiveModal(true)}
                className="flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground rounded-xl font-semibold"
                data-testid="button-receive"
              >
                <QrCode className="w-5 h-5" />
                {text.receive}
              </button>
              <button
                onClick={openSendModal}
                className="flex items-center justify-center gap-2 h-12 bg-card border border-border rounded-xl font-semibold"
                data-testid="button-send"
              >
                <Send className="w-5 h-5" />
                {text.send}
              </button>
            </div>

            <div className="bg-card rounded-2xl overflow-hidden">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("balances")}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                    activeTab === "balances" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground"
                  }`}
                  data-testid="tab-balances"
                >
                  <Wallet className="w-4 h-4" />
                  {text.balances}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                    activeTab === "history" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground"
                  }`}
                  data-testid="tab-history"
                >
                  <History className="w-4 h-4" />
                  {text.history}
                </button>
              </div>

              {activeTab === "balances" && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{text.balance} (USDT)</h3>
                    <button
                      onClick={loadAllData}
                      disabled={refreshingBalances}
                      className="text-sm text-primary flex items-center gap-1"
                      data-testid="button-refresh-balances"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshingBalances ? 'animate-spin' : ''}`} />
                      {text.refreshBalances}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(networks).map(([key, network]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium">{network.name}</span>
                          {nativeBalances?.balances[key] && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Fuel className="w-3 h-3" />
                              {parseFloat(nativeBalances.balances[key].balance).toFixed(4)} {nativeBalances.balances[key].symbol}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-sm">
                          {balances?.balances[key] ? formatBalance(balances.balances[key]) : "0.00"} USDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">{text.history}</h3>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{text.noTransactions}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "send" ? "bg-red-500/10" : "bg-green-500/10"
                          }`}>
                            {tx.type === "send" ? (
                              <ArrowUpRightFromCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {tx.type === "send" ? text.sent : text.received}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {networks[tx.network]?.name || tx.network}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {tx.type === "send" ? tx.toAddress : tx.fromAddress}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              tx.type === "send" ? "text-red-400" : "text-green-400"
                            }`}>
                              {tx.type === "send" ? "-" : "+"}{tx.amount} {tx.token}
                            </span>
                            {tx.explorerUrl && (
                              <a
                                href={tx.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary flex items-center gap-1 justify-end mt-0.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showReceiveModal && wallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{text.receive} USDT</h3>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center"
                data-testid="button-close-receive"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">{text.selectNetwork}</label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full h-12 px-4 bg-background rounded-xl border border-border"
                data-testid="select-receive-network"
              >
                {Object.entries(networks).map(([key, network]) => (
                  <option key={key} value={key}>{network.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center py-4">
              <div className="bg-white p-4 rounded-xl">
                <QRCode 
                  value={getAddressForNetwork(selectedNetwork)} 
                  size={180}
                  level="H"
                />
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">{text.scanToReceive}</p>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                {networks[selectedNetwork]?.name || "Address"}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background rounded-lg p-3 overflow-hidden text-ellipsis">
                  {getAddressForNetwork(selectedNetwork)}
                </code>
                <button
                  onClick={() => copyAddress(getAddressForNetwork(selectedNetwork), selectedNetwork)}
                  className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-2"
                  data-testid="button-copy-receive-address"
                >
                  {copiedAddress === selectedNetwork ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {text.copyAddress}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowReceiveModal(false)}
              className="w-full h-12 bg-background rounded-xl font-semibold"
              data-testid="button-close-receive-modal"
            >
              {text.close}
            </button>
          </div>
        </div>
      )}

      {showSendModal && wallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{text.send} USDT</h3>
              <button
                onClick={closeSendModal}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center"
                data-testid="button-close-send"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sendStep === "form" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">{text.selectNetwork}</label>
                  <select
                    value={sendNetwork}
                    onChange={(e) => {
                      setSendNetwork(e.target.value);
                      setAddressValid(null);
                      if (sendAddress) handleAddressChange(sendAddress);
                    }}
                    className="w-full h-12 px-4 bg-background rounded-xl border border-border"
                    data-testid="select-send-network"
                  >
                    {Object.entries(networks).map(([key, network]) => (
                      <option key={key} value={key}>{network.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">{text.recipientAddress}</label>
                    <button
                      type="button"
                      onClick={() => setShowAddressBook(!showAddressBook)}
                      className="text-xs text-primary flex items-center gap-1"
                      data-testid="button-toggle-address-book"
                    >
                      <BookUser className="w-3 h-3" />
                      {text.addressBook}
                    </button>
                  </div>
                  
                  {showAddressBook && (
                    <div className="bg-background rounded-xl border border-border p-3 space-y-2 mb-2">
                      {addressBook.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">{text.noSavedAddresses}</p>
                      ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {addressBook.filter(e => e.network === sendNetwork || 
                            (networks[e.network]?.type === networks[sendNetwork]?.type)
                          ).map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-card cursor-pointer group"
                              onClick={() => selectContact(entry)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{entry.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{entry.address}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContact(entry.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={sendAddress}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder={networks[sendNetwork]?.type === "tron" ? "T..." : "0x..."}
                      className={`w-full h-12 px-4 pr-10 bg-background rounded-xl border outline-none ${
                        addressValid === true ? 'border-green-500' : 
                        addressValid === false ? 'border-red-500' : 'border-border'
                      }`}
                      data-testid="input-send-address"
                    />
                    {validatingAddress && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!validatingAddress && addressValid === true && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    {!validatingAddress && addressValid === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {addressValid === false && (
                    <p className="text-xs text-red-500">{text.invalidAddress}</p>
                  )}
                  
                  {addressValid === true && sendAddress && !addressBook.some(e => e.address === sendAddress) && (
                    <div>
                      {showAddContact ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            placeholder={text.contactName}
                            className="flex-1 h-8 px-3 bg-background rounded-lg border border-border text-sm"
                            data-testid="input-contact-name"
                          />
                          <button
                            onClick={handleAddContact}
                            className="px-3 h-8 bg-primary text-primary-foreground rounded-lg text-sm"
                            data-testid="button-save-contact"
                          >
                            {text.saveContact}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddContact(false);
                              setNewContactName("");
                            }}
                            className="px-2 h-8 text-muted-foreground text-sm"
                          >
                            {text.cancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddContact(true)}
                          className="text-xs text-primary flex items-center gap-1"
                          data-testid="button-add-contact"
                        >
                          <Plus className="w-3 h-3" />
                          {text.addContact}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">{text.amount}</label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-12 px-4 bg-background rounded-xl border border-border outline-none"
                    data-testid="input-send-amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    {text.balance}: {balances?.balances[sendNetwork] ? formatBalance(balances.balances[sendNetwork]) : "0.00"} USDT
                  </p>
                </div>

                <button
                  onClick={handleEstimateGas}
                  disabled={!sendAddress || !sendAmount || addressValid !== true || estimatingGas}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="button-continue-send"
                >
                  {estimatingGas ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    text.continue
                  )}
                </button>
              </div>
            )}

            {sendStep === "confirm" && gasEstimate && (
              <div className="space-y-4">
                <div className="bg-background rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{text.amount}</span>
                    <span className="font-mono font-semibold">{sendAmount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span>{networks[sendNetwork]?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-mono text-sm">{sendAddress.slice(0, 8)}...{sendAddress.slice(-6)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{text.estimatedFee}</span>
                      <div className="text-right">
                        <span className="font-mono">{gasEstimate.estimatedCostNative || gasEstimate.estimatedTrx} {gasEstimate.nativeSymbol || "TRX"}</span>
                        <p className="text-xs text-muted-foreground">≈ ${gasEstimate.estimatedCostUsd}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">{text.confirmWithPassword}</label>
                  <input
                    type="password"
                    value={sendPassword}
                    onChange={(e) => setSendPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full h-12 px-4 bg-background rounded-xl border border-border outline-none"
                    data-testid="input-send-password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSendStep("form")}
                    className="h-12 bg-background rounded-xl font-semibold"
                    data-testid="button-back-send"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSendUsdt}
                    disabled={!sendPassword}
                    className="h-12 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
                    data-testid="button-confirm-send"
                  >
                    {text.confirmSend}
                  </button>
                </div>
              </div>
            )}

            {sendStep === "sending" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-lg font-semibold">{text.sending}</p>
                <p className="text-sm text-muted-foreground">Please wait while your transaction is being processed...</p>
              </div>
            )}

            {sendStep === "success" && sendResult && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-lg font-bold">{text.transactionSuccess}</h4>
                <p className="text-sm text-muted-foreground">
                  {sendAmount} USDT sent to {sendAddress.slice(0, 8)}...{sendAddress.slice(-6)}
                </p>
                
                {sendResult.explorerUrl && (
                  <a
                    href={sendResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                    data-testid="link-explorer"
                  >
                    {text.viewOnExplorer}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={closeSendModal}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold mt-4"
                  data-testid="button-done-send"
                >
                  {text.done}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
