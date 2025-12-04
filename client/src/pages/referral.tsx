import { PageContainer } from "@/components/page-container";
import { Users, Copy, Share2, TrendingUp, ArrowLeft, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

export default function ReferralProgram() {
  const [, setLocation] = useLocation();
  const [commission, setCommission] = useState([2.5]);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <h1 className="font-display font-bold text-lg tracking-wide">{t("referral.title")}</h1>
          <div className="w-10" />
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary via-[#7c3aed] to-accent rounded-[2.5rem] p-1 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
             <div className="bg-background/90 backdrop-blur-xl rounded-[2.3rem] p-6 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Users className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-2">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t("referral.totalEarnings")}</p>
                  <h2 className="text-5xl font-display font-bold text-white tracking-tight" data-testid="text-total-earnings">R$ 0,00</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 relative z-10">
                  <div className="text-left p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <p className="text-xs text-muted-foreground font-medium">{t("referral.invitedUsers")}</p>
                    <p className="text-2xl font-bold font-display" data-testid="text-invited-users">0</p>
                  </div>
                  <div className="text-left p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <p className="text-xs text-muted-foreground font-medium">{t("referral.totalVolume")}</p>
                    <p className="text-2xl font-bold font-display" data-testid="text-total-volume">R$ 0</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display font-bold text-lg">{t("referral.yourCommission")}</h3>
              <span className="text-2xl font-bold text-primary font-display">{commission}%</span>
            </div>
            <div className="glass-card rounded-3xl p-6 space-y-8 border border-white/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("referral.commissionDescription")}
              </p>
              <div>
                <Slider 
                  value={commission} 
                  onValueChange={setCommission} 
                  max={5} 
                  step={0.1}
                  className="py-4"
                  data-testid="slider-commission"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono mt-2 font-medium">
                  <span>0%</span>
                  <span>2.5%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg px-1">{t("referral.shareYourCode")}</h3>
            <div className="flex gap-3">
              <div className="flex-1 glass-card border border-white/10 rounded-2xl p-4 flex items-center justify-center font-mono text-xl font-bold tracking-[0.2em] text-muted-foreground" data-testid="text-referral-code">
                {t("referral.comingSoon")}
              </div>
              <Button 
                onClick={handleCopy}
                disabled
                className={cn(
                  "h-14 px-6 rounded-2xl transition-all w-20 font-bold shadow-lg hover:shadow-xl",
                  copied ? "bg-green-500 text-white shadow-green-500/25 hover:shadow-green-500/40" : "bg-white/10 text-white hover:bg-white/20 shadow-white/10"
                )}
                data-testid="button-copy-code"
              >
                {copied ? <Check className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
              </Button>
            </div>
            <Button 
              disabled
              className="w-full h-16 bg-gradient-to-r from-primary/50 to-[#7c3aed]/50 text-white/70 rounded-2xl font-bold text-lg"
              data-testid="button-invite-friends"
            >
              <Share2 className="w-6 h-6 mr-2" />
              {t("referral.inviteFriends")}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display font-bold text-lg">{t("referral.recentEarnings")}</h3>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">{t("referral.comingSoonTitle")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("referral.comingSoonDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
