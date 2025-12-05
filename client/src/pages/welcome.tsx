import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import logo from "@assets/Untitled_1764830265098.png";
import { useLanguage } from "@/context/LanguageContext";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const t = {
    futureOf: language === "pt-BR" ? "O Futuro dos" : "Future of",
    payments: language === "pt-BR" ? "Pagamentos" : "Payments",
    description: language === "pt-BR" 
      ? "Gerencie BRL, Pix e Cripto em um único aplicativo." 
      : "Seamlessly manage BRL, Pix, and Crypto in one beautiful app.",
    getStarted: language === "pt-BR" ? "Começar" : "Get Started",
    haveAccount: language === "pt-BR" ? "Já tenho uma conta" : "I have an account",
  };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-accent/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <img src={logo} alt="Otsem Pay" className="w-48 h-auto drop-shadow-2xl" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-4 max-w-xs"
        >
          <h1 className="text-4xl font-display font-bold tracking-tight">
            {t.futureOf} <span className="text-gradient">{t.payments}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.description}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="p-8 w-full max-w-md mx-auto space-y-4 relative z-10"
      >
        <Button 
          className="w-full h-16 text-lg rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] font-bold transition-all hover:scale-[1.02]"
          onClick={() => setLocation("/auth")}
          data-testid="button-get-started"
        >
          {t.getStarted}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full h-16 text-lg rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:scale-[1.02]"
          onClick={() => setLocation("/auth")}
          data-testid="button-have-account"
        >
          {t.haveAccount}
        </Button>
      </motion.div>
    </div>
  );
}
