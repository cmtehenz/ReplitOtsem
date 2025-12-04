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
