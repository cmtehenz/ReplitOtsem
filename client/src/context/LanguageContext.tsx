import React, { createContext, useContext, useState } from "react";

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
    "wallet.subtitle": "The future of crypto payments",
    "wallet.balance": "Total Balance",
    "wallet.deposit": "Deposit",
    "wallet.send": "Send",
    "wallet.receive": "Receive",
    "wallet.assets": "Your Assets",
    
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
    "auth.welcome": "Welcome to Otsem",
    "auth.chooseMethod": "Choose how you'd like to continue",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.continueWithGitHub": "Continue with GitHub",
    "auth.continueWithApple": "Continue with Apple",
    "auth.continueWithEmail": "Continue with Email",
    "auth.or": "or",
    "auth.backToOptions": "Back to options",
    
    // Onboarding
    "onboarding.skip": "Skip",
    "onboarding.next": "Next",
    "onboarding.getStarted": "Get Started",
    "onboarding.screen1Title": "Welcome to Otsem Pay",
    "onboarding.screen1Subtitle": "The future of payments in your hands. Manage BRL, PIX, and USDT in one beautiful app.",
    "onboarding.screen2Title": "Instant PIX Deposits",
    "onboarding.screen2Subtitle": "Deposit BRL instantly using PIX. Real bank integration with Banco Inter for secure transactions.",
    "onboarding.screen3Title": "Exchange Crypto Easily",
    "onboarding.screen3Subtitle": "Convert between BRL and USDT at competitive rates. Real-time pricing powered by OKX.",
    "onboarding.screen4Title": "Secure & Fast Withdrawals",
    "onboarding.screen4Subtitle": "Withdraw to any PIX key instantly. Bank-level security with mTLS encryption.",
    
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
    "profile.limits": "Daily Limits",
    "profile.pixDeposit": "Pix Deposit",
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
    
    // Common
    "common.processing": "Processing...",
    "common.retry": "Try Again",
  },
  "pt-BR": {
    // Navigation
    "nav.home": "Início",
    "nav.wallet": "Carteira",
    "nav.feed": "Feed",
    "nav.card": "Cartão",
    
    // Wallet
    "wallet.title": "Carteira",
    "wallet.subtitle": "O futuro dos pagamentos cripto",
    "wallet.balance": "Saldo Total",
    "wallet.deposit": "Depositar",
    "wallet.send": "Enviar",
    "wallet.receive": "Receber",
    "wallet.assets": "Seus Ativos",
    
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
    "auth.welcome": "Bem-vindo ao Otsem",
    "auth.chooseMethod": "Escolha como deseja continuar",
    "auth.continueWithGoogle": "Continuar com Google",
    "auth.continueWithGitHub": "Continuar com GitHub",
    "auth.continueWithApple": "Continuar com Apple",
    "auth.continueWithEmail": "Continuar com Email",
    "auth.or": "ou",
    "auth.backToOptions": "Voltar às opções",
    
    // Onboarding
    "onboarding.skip": "Pular",
    "onboarding.next": "Próximo",
    "onboarding.getStarted": "Começar",
    "onboarding.screen1Title": "Bem-vindo ao Otsem Pay",
    "onboarding.screen1Subtitle": "O futuro dos pagamentos em suas mãos. Gerencie BRL, PIX e USDT em um só lugar.",
    "onboarding.screen2Title": "Depósitos PIX Instantâneos",
    "onboarding.screen2Subtitle": "Deposite BRL instantaneamente via PIX. Integração real com Banco Inter para transações seguras.",
    "onboarding.screen3Title": "Troque Cripto Facilmente",
    "onboarding.screen3Subtitle": "Converta entre BRL e USDT a taxas competitivas. Preços em tempo real powered by OKX.",
    "onboarding.screen4Title": "Saques Seguros e Rápidos",
    "onboarding.screen4Subtitle": "Saque para qualquer chave PIX instantaneamente. Segurança bancária com criptografia mTLS.",
    
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
    "profile.limits": "Limites Diários",
    "profile.pixDeposit": "Depósito Pix",
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
    
    // Common
    "common.processing": "Processando...",
    "common.retry": "Tentar Novamente",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
