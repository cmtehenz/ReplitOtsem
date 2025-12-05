import { PageContainer } from "@/components/page-container";
import { Users, ArrowLeft, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

export default function ReferralProgram() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {language === "pt-BR" ? "Programa de Indicação" : "Referral Program"}
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-[#7c3aed] rounded-full flex items-center justify-center shadow-2xl">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-display font-bold tracking-tight">
              {language === "pt-BR" ? "Em Breve" : "Coming Soon"}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {language === "pt-BR" 
                ? "Estamos preparando um programa de indicação incrível para você. Ganhe recompensas por convidar amigos para o Otsem Pay!"
                : "We're preparing an amazing referral program for you. Earn rewards by inviting friends to Otsem Pay!"
              }
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10 w-full max-w-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold">
                  {language === "pt-BR" ? "Ganhe até 5%" : "Earn up to 5%"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "pt-BR" 
                    ? "Em cada transação dos seus indicados"
                    : "On every transaction from your referrals"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
