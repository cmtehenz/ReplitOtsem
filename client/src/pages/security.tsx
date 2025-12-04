import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Security() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full min-h-[80vh]">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {isPortuguese ? "Segurança" : "Security"}
          </h1>
          <div className="w-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>

          <div className="space-y-3 max-w-xs">
            <h2 className="text-2xl font-display font-bold tracking-tight">
              {isPortuguese ? "Em Breve" : "Coming Soon"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isPortuguese 
                ? "Configurações avançadas de segurança como 2FA estarão disponíveis em breve." 
                : "Advanced security settings like 2FA will be available soon."}
            </p>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
