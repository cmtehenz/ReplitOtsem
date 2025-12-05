import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "pt-BR";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.wallet": "Wallet",
    "nav.feed": "Feed",
    "nav.card": "Card",
    
    // Wallet
    "wallet.title": "Wallet",
    "wallet.subtitle": "",
    "wallet.balance": "Total Balance",
    "wallet.totalBalance": "Total Balance",
    "wallet.deposit": "Deposit",
    "wallet.send": "Send",
    "wallet.receive": "Receive",
    "wallet.assets": "Your Assets",
    "wallet.yourAssets": "Your Assets",
    "wallet.thisMonth": "this month",
    "wallet.exchange": "Exchange",
    
    // Auth
    "auth.login": "Sign In",
    "auth.register": "Sign Up",
    "auth.loginDescription": "Enter your credentials to access your wallet",
    "auth.registerDescription": "Create an account to start trading",
    "auth.name": "Full Name",
    "auth.namePlaceholder": "Your full name",
    "auth.username": "Username",
    "auth.usernameOrEmail": "Username or Email",
    "auth.usernamePlaceholder": "Choose a username",
    "auth.usernameOrEmailPlaceholder": "Your username or email",
    "auth.email": "Email",
    "auth.emailPlaceholder": "your@email.com",
    "auth.password": "Password",
    "auth.optional": "optional",
    "auth.cpfHelp": "Required for PIX withdrawals to your own account",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.forgotPassword": "Forgot password?",
    "auth.twoFactorTitle": "Two-Factor Authentication",
    "auth.twoFactorDescription": "Enter the 6-digit code from your authenticator app",
    "auth.twoFactorBackupHint": "You can also use a backup code",
    "auth.verify": "Verify",
    "auth.backToLogin": "Back to login",
    
    // Forgot Password
    "forgotPassword.title": "Reset Password",
    "forgotPassword.description": "Enter your email address and we'll send you a link to reset your password",
    "forgotPassword.sendLink": "Send Reset Link",
    "forgotPassword.backToLogin": "Back to Login",
    "forgotPassword.emailSent": "Check Your Email",
    "forgotPassword.checkInbox": "We've sent password reset instructions to your email",
    "forgotPassword.sentTo": "Sent to:",
    
    // Feed
    "feed.title": "Feed",
    "feed.latest": "Latest Crypto News",
    "feed.breaking": "Breaking News",
    "feed.markets": "Market Updates",
    "feed.readMore": "Read More",
    
    // Profile
    "profile.title": "Profile",
    "profile.language": "Language",
    "profile.english": "English",
    "profile.portuguese": "Português (Brasil)",
    "profile.personalInfo": "Personal Information",
    "profile.referral": "Referral Program",
    "profile.pixKeys": "Saved Pix Keys",
    "profile.security": "Security & 2FA",
    "profile.help": "Help & Support",
    "profile.signOut": "Sign Out",
    "profile.verified": "Verified Level 2",
    "profile.limits": "Monthly Limits",
    "profile.pixDeposit": "Pix Deposit",
    "profile.monthlyLimit": "Monthly Limit",
    "profile.upgradeButton": "Tap to upgrade limits",
    
    // Activity
    "activity.title": "Activity",
    "activity.search": "Search transactions...",
    "activity.completed": "Completed",
    "activity.pending": "Pending",
    
    // Cards
    "cards.title": "Cards",
    "cards.comingSoon": "Coming Soon",
    "cards.message": "Soon you will be able to spend crypto assets globally online and in-store using Otsem Card",
    "cards.holder": "Card Holder",
    "cards.expires": "Expires",
    
    // Referral
    "referral.title": "Referral Program",
    "referral.earnings": "Total Earnings",
    "referral.commission": "Your Commission",
    "referral.invite": "Invite Friends",
    "referral.withdraw": "Withdraw",
    "referral.invitedUsers": "Invited Users",
    "referral.totalVolume": "Total Volume",
    
    // KYC
    "kyc.title": "Verification",
    "kyc.verifyIdentity": "Verify Identity",
    "kyc.startVerification": "Start Verification",
    "kyc.takePhoto": "Take Photo",
    "kyc.ready": "I'm Ready",
    "kyc.verified": "Verified!",
    "kyc.back": "Back to Profile",
    
    // Exchange
    "exchange.title": "Exchange",
    "exchange.youPay": "You pay",
    "exchange.youReceive": "You receive",
    "exchange.balance": "Balance",
    "exchange.estimated": "Estimated",
    "exchange.fee": "Fee",
    "exchange.minimum": "Minimum",
    "exchange.buyUsdt": "Buy USDT",
    "exchange.sellUsdt": "Sell USDT",
    "exchange.success": "Exchange completed successfully!",
    "exchange.failed": "Exchange failed",
    "exchange.invalidAmount": "Please enter a valid amount",
    "exchange.insufficientBalance": "Insufficient balance",
    "exchange.minAmount": "Minimum exchange is 10 USDT",
    "exchange.ratesUnavailable": "Exchange rates temporarily unavailable",
    "exchange.loadingRate": "Loading rate...",
    
    // Personal Info
    "personalInfo.title": "Personal Information",
    "personalInfo.name": "Full Name",
    "personalInfo.namePlaceholder": "Enter your full name",
    "personalInfo.email": "Email",
    "personalInfo.emailPlaceholder": "Enter your email",
    "personalInfo.phone": "Phone",
    "personalInfo.phonePlaceholder": "Enter your phone number",
    "personalInfo.tapToChange": "Tap to change photo",
    "personalInfo.save": "Save Changes",
    "personalInfo.saved": "Profile updated successfully",
    "personalInfo.saveFailed": "Failed to update profile",
    "personalInfo.nameRequired": "Name is required",
    "personalInfo.emailInvalid": "Please enter a valid email",
    "personalInfo.photoTooLarge": "Photo must be less than 2MB",
    
    // PIX
    "pix.deposit": "Deposit via PIX",
    "pix.withdraw": "Withdraw via PIX",
    "pix.payment": "PIX Payment",
    "pix.generateQr": "Generate PIX",
    "pix.copyPaste": "PIX Copy & Paste",
    "pix.copied": "Copied!",
    "pix.copyKey": "Copy PIX Key",
    "pix.scanQr": "Scan the QR code or copy the key below",
    "pix.amountBrl": "Amount (BRL)",
    "pix.minDeposit": "Minimum deposit is R$ 1.00",
    "pix.minWithdraw": "Minimum withdrawal is R$ 1.00",
    "pix.selectKey": "Select PIX Key",
    "pix.noKeys": "No PIX keys registered",
    "pix.noKeysDesc": "Add a key in your profile to enable withdrawals",
    "pix.available": "Available",
    "pix.withdrawButton": "Withdraw",
    "pix.insufficientBalance": "Insufficient balance",
    "pix.selectKeyError": "Please select a PIX key",
    "pix.withdrawSuccess": "Withdrawal processed successfully!",
    
    // PIX Keys
    "pixKeys.title": "Saved Pix Keys",
    "pixKeys.whyRegister": "Why register keys?",
    "pixKeys.whyRegisterDesc": "Registering keys allows you to withdraw BRL to your bank account instantly using PIX.",
    "pixKeys.yourKeys": "Your Registered Keys",
    "pixKeys.noKeys": "No PIX keys registered yet",
    "pixKeys.noKeysDesc": "Add a key to enable withdrawals",
    "pixKeys.registerNew": "Register New Key",
    "pixKeys.keyValue": "Key Value",
    "pixKeys.keyName": "Name (optional)",
    "pixKeys.keyNamePlaceholder": "My personal key...",
    "pixKeys.registerButton": "Register Key",
    "pixKeys.addSuccess": "PIX key added successfully!",
    "pixKeys.deleteSuccess": "PIX key removed",
    "pixKeys.enterValue": "Please enter a key value",
    
    // Common
    "common.processing": "Processing...",
    "common.retry": "Try Again",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success!",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.next": "Next",
    "common.done": "Done",
    "common.close": "Close",
    "common.viewAll": "View all",
    
    // Dashboard
    "dashboard.welcome": "Welcome back",
    
    // Activity
    "activity.today": "Today",
    "activity.yesterday": "Yesterday",
    "activity.thisWeek": "This Week",
    "activity.earlier": "Earlier",
    "activity.empty": "No transactions yet",
    "activity.emptyDesc": "Your transactions will appear here",
    "activity.recentActivity": "Recent Activity",
    
    // Assets
    "assets.title": "Assets",
    "assets.tether": "Tether",
    "assets.brazilianReal": "Brazilian Real",
    "assets.bitcoin": "Bitcoin",
    
    // Transaction Details
    "transaction.receipt": "Receipt",
    "transaction.transferSuccessful": "Transfer Successful",
    "transaction.type": "Transaction Type",
    "transaction.recipient": "Recipient",
    "transaction.pixKey": "Pix Key",
    "transaction.transactionId": "Transaction ID",
    "transaction.savePdf": "Save PDF",
    "transaction.newTransfer": "New Transfer",
    "transaction.pixSent": "Pix Sent",
    "transaction.pixReceived": "Pix Received",
    "transaction.exchangeComplete": "Exchange Complete",
    "transaction.depositComplete": "Deposit Complete",
    "transaction.withdrawalComplete": "Withdrawal Complete",
  },
  "pt-BR": {
    // Navigation
    "nav.home": "Início",
    "nav.wallet": "Carteira",
    "nav.feed": "Feed",
    "nav.card": "Cartão",
    
    // Wallet
    "wallet.title": "Carteira",
    "wallet.subtitle": "",
    "wallet.balance": "Saldo Total",
    "wallet.totalBalance": "Saldo Total",
    "wallet.deposit": "Depositar",
    "wallet.send": "Enviar",
    "wallet.receive": "Receber",
    "wallet.assets": "Seus Ativos",
    "wallet.yourAssets": "Seus Ativos",
    "wallet.thisMonth": "este mês",
    "wallet.exchange": "Câmbio",
    
    // Auth
    "auth.login": "Entrar",
    "auth.register": "Criar Conta",
    "auth.loginDescription": "Digite suas credenciais para acessar sua carteira",
    "auth.registerDescription": "Crie uma conta para começar a negociar",
    "auth.name": "Nome Completo",
    "auth.namePlaceholder": "Seu nome completo",
    "auth.username": "Nome de Usuário",
    "auth.usernameOrEmail": "Usuário ou Email",
    "auth.usernamePlaceholder": "Escolha um nome de usuário",
    "auth.usernameOrEmailPlaceholder": "Seu usuário ou email",
    "auth.email": "Email",
    "auth.emailPlaceholder": "seu@email.com",
    "auth.password": "Senha",
    "auth.optional": "opcional",
    "auth.cpfHelp": "Necessário para saques PIX para sua própria conta",
    "auth.noAccount": "Não tem uma conta?",
    "auth.hasAccount": "Já tem uma conta?",
    "auth.forgotPassword": "Esqueceu a senha?",
    "auth.twoFactorTitle": "Autenticação de Dois Fatores",
    "auth.twoFactorDescription": "Digite o código de 6 dígitos do seu app autenticador",
    "auth.twoFactorBackupHint": "Você também pode usar um código de backup",
    "auth.verify": "Verificar",
    "auth.backToLogin": "Voltar ao login",
    
    // Forgot Password
    "forgotPassword.title": "Redefinir Senha",
    "forgotPassword.description": "Digite seu email e enviaremos um link para redefinir sua senha",
    "forgotPassword.sendLink": "Enviar Link",
    "forgotPassword.backToLogin": "Voltar ao Login",
    "forgotPassword.emailSent": "Verifique seu Email",
    "forgotPassword.checkInbox": "Enviamos instruções de redefinição de senha para seu email",
    "forgotPassword.sentTo": "Enviado para:",
    
    // Feed
    "feed.title": "Feed",
    "feed.latest": "Últimas Notícias de Criptomoedas",
    "feed.breaking": "Notícias de Destaque",
    "feed.markets": "Atualizações de Mercado",
    "feed.readMore": "Ler Mais",
    
    // Profile
    "profile.title": "Perfil",
    "profile.language": "Idioma",
    "profile.english": "English",
    "profile.portuguese": "Português (Brasil)",
    "profile.personalInfo": "Informações Pessoais",
    "profile.referral": "Programa de Indicação",
    "profile.pixKeys": "Chaves Pix Salvas",
    "profile.security": "Segurança & 2FA",
    "profile.help": "Ajuda & Suporte",
    "profile.signOut": "Sair",
    "profile.verified": "Nível 2 Verificado",
    "profile.limits": "Limites Mensais",
    "profile.pixDeposit": "Depósito Pix",
    "profile.monthlyLimit": "Limite Mensal",
    "profile.upgradeButton": "Toque para aumentar limites",
    
    // Activity
    "activity.title": "Atividade",
    "activity.search": "Pesquisar transações...",
    "activity.completed": "Concluído",
    "activity.pending": "Pendente",
    
    // Cards
    "cards.title": "Cartões",
    "cards.comingSoon": "Em Breve",
    "cards.message": "Em breve você poderá gastar ativos cripto globalmente online e nas lojas usando o Cartão Otsem",
    "cards.holder": "Titular",
    "cards.expires": "Validade",
    
    // Referral
    "referral.title": "Programa de Indicação",
    "referral.earnings": "Ganhos Totais",
    "referral.commission": "Sua Comissão",
    "referral.invite": "Convidar Amigos",
    "referral.withdraw": "Sacar",
    "referral.invitedUsers": "Usuários Convidados",
    "referral.totalVolume": "Volume Total",
    
    // KYC
    "kyc.title": "Verificação",
    "kyc.verifyIdentity": "Verificar Identidade",
    "kyc.startVerification": "Iniciar Verificação",
    "kyc.takePhoto": "Tirar Foto",
    "kyc.ready": "Estou Pronto",
    "kyc.verified": "Verificado!",
    "kyc.back": "Voltar ao Perfil",
    
    // Exchange
    "exchange.title": "Câmbio",
    "exchange.youPay": "Você paga",
    "exchange.youReceive": "Você recebe",
    "exchange.balance": "Saldo",
    "exchange.estimated": "Estimado",
    "exchange.fee": "Taxa",
    "exchange.minimum": "Mínimo",
    "exchange.buyUsdt": "Comprar USDT",
    "exchange.sellUsdt": "Vender USDT",
    "exchange.success": "Câmbio realizado com sucesso!",
    "exchange.failed": "Falha no câmbio",
    "exchange.invalidAmount": "Por favor, insira um valor válido",
    "exchange.insufficientBalance": "Saldo insuficiente",
    "exchange.minAmount": "Câmbio mínimo é 10 USDT",
    "exchange.ratesUnavailable": "Taxas de câmbio temporariamente indisponíveis",
    "exchange.loadingRate": "Carregando taxa...",
    
    // Personal Info
    "personalInfo.title": "Informações Pessoais",
    "personalInfo.name": "Nome Completo",
    "personalInfo.namePlaceholder": "Digite seu nome completo",
    "personalInfo.email": "Email",
    "personalInfo.emailPlaceholder": "Digite seu email",
    "personalInfo.phone": "Telefone",
    "personalInfo.phonePlaceholder": "Digite seu telefone",
    "personalInfo.tapToChange": "Toque para alterar foto",
    "personalInfo.save": "Salvar Alterações",
    "personalInfo.saved": "Perfil atualizado com sucesso",
    "personalInfo.saveFailed": "Falha ao atualizar perfil",
    "personalInfo.nameRequired": "Nome é obrigatório",
    "personalInfo.emailInvalid": "Por favor, insira um email válido",
    "personalInfo.photoTooLarge": "Foto deve ter menos de 2MB",
    
    // PIX
    "pix.deposit": "Depositar via PIX",
    "pix.withdraw": "Sacar via PIX",
    "pix.payment": "Pagamento PIX",
    "pix.generateQr": "Gerar PIX",
    "pix.copyPaste": "PIX Copia e Cola",
    "pix.copied": "Copiado!",
    "pix.copyKey": "Copiar Chave PIX",
    "pix.scanQr": "Escaneie o QR code ou copie a chave abaixo",
    "pix.amountBrl": "Valor (BRL)",
    "pix.minDeposit": "Depósito mínimo é R$ 1,00",
    "pix.minWithdraw": "Saque mínimo é R$ 1,00",
    "pix.selectKey": "Selecionar Chave PIX",
    "pix.noKeys": "Nenhuma chave PIX cadastrada",
    "pix.noKeysDesc": "Adicione uma chave no seu perfil para habilitar saques",
    "pix.available": "Disponível",
    "pix.withdrawButton": "Sacar",
    "pix.insufficientBalance": "Saldo insuficiente",
    "pix.selectKeyError": "Por favor, selecione uma chave PIX",
    "pix.withdrawSuccess": "Saque processado com sucesso!",
    
    // PIX Keys
    "pixKeys.title": "Chaves Pix Salvas",
    "pixKeys.whyRegister": "Por que cadastrar chaves?",
    "pixKeys.whyRegisterDesc": "Cadastrar chaves permite sacar BRL para sua conta bancária instantaneamente via PIX.",
    "pixKeys.yourKeys": "Suas Chaves Cadastradas",
    "pixKeys.noKeys": "Nenhuma chave PIX cadastrada",
    "pixKeys.noKeysDesc": "Adicione uma chave para habilitar saques",
    "pixKeys.registerNew": "Cadastrar Nova Chave",
    "pixKeys.keyValue": "Valor da Chave",
    "pixKeys.keyName": "Nome (opcional)",
    "pixKeys.keyNamePlaceholder": "Minha chave pessoal...",
    "pixKeys.registerButton": "Cadastrar Chave",
    "pixKeys.addSuccess": "Chave PIX adicionada com sucesso!",
    "pixKeys.deleteSuccess": "Chave PIX removida",
    "pixKeys.enterValue": "Por favor, insira o valor da chave",
    
    // Common
    "common.processing": "Processando...",
    "common.retry": "Tentar Novamente",
    "common.loading": "Carregando...",
    "common.error": "Ocorreu um erro",
    "common.success": "Sucesso!",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.save": "Salvar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.back": "Voltar",
    "common.next": "Próximo",
    "common.done": "Concluir",
    "common.close": "Fechar",
    "common.viewAll": "Ver tudo",
    
    // Dashboard
    "dashboard.welcome": "Bem-vindo",
    
    // Activity
    "activity.today": "Hoje",
    "activity.yesterday": "Ontem",
    "activity.thisWeek": "Esta Semana",
    "activity.earlier": "Anteriores",
    "activity.empty": "Nenhuma transação ainda",
    "activity.emptyDesc": "Suas transações aparecerão aqui",
    "activity.recentActivity": "Atividade Recente",
    
    // Assets
    "assets.title": "Ativos",
    "assets.tether": "Tether",
    "assets.brazilianReal": "Real Brasileiro",
    "assets.bitcoin": "Bitcoin",
    
    // Transaction Details
    "transaction.receipt": "Comprovante",
    "transaction.transferSuccessful": "Transferência Realizada",
    "transaction.type": "Tipo de Transação",
    "transaction.recipient": "Destinatário",
    "transaction.pixKey": "Chave Pix",
    "transaction.transactionId": "ID da Transação",
    "transaction.savePdf": "Salvar PDF",
    "transaction.newTransfer": "Nova Transferência",
    "transaction.pixSent": "Pix Enviado",
    "transaction.pixReceived": "Pix Recebido",
    "transaction.exchangeComplete": "Câmbio Realizado",
    "transaction.depositComplete": "Depósito Concluído",
    "transaction.withdrawalComplete": "Saque Concluído",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("otsem-language");
      return (saved as Language) || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("otsem-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("otsem-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
