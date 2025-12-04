import { User, Shield, CreditCard, LogOut, ChevronRight, HelpCircle, BadgeCheck, Users, Globe, Loader2 } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Profile() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLocation("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-display font-bold tracking-tight">{t("profile.title")}</h1>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors shadow-lg">
              <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1 space-y-0.5">
            <h2 className="text-lg font-bold font-display" data-testid="text-profile-name">
              {user?.name || user?.username || "User"}
            </h2>
            <p className="text-xs text-muted-foreground" data-testid="text-profile-email">
              {user?.email || ""}
            </p>
            {user?.verified && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-[#26A17B] bg-[#26A17B]/10 px-2 py-0.5 rounded-full w-fit border border-[#26A17B]/20 uppercase font-bold tracking-wide">
                <BadgeCheck className="w-3 h-3" />
                <span>{t("profile.verified")}</span>
              </div>
            )}
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-4 border border-primary/20 cursor-pointer hover:bg-primary/5 transition-all active:scale-[0.98] group shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
          onClick={() => setLocation("/kyc")}
          data-testid="link-kyc"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-primary font-display text-base">{t("profile.limits")}</h3>
            <span className="text-[10px] bg-background/50 px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-md border border-white/5">
              Level 2 <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">{t("profile.pixDeposit")}</span>
              <span>R$ 4.250 / R$ 50.000</span>
            </div>
            <div className="h-1.5 bg-background/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-primary to-accent w-[8%] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            </div>
            <p className="text-[10px] text-primary/80 mt-1 text-center font-medium group-hover:text-primary transition-colors">{t("profile.upgradeButton")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <MenuItem icon={User} label={t("profile.personalInfo")} />
          <MenuItem 
            icon={Users} 
            label={t("profile.referral")} 
            onClick={() => setLocation("/referral")}
            badge="Earn Money"
          />
          <MenuItem 
            icon={CreditCard} 
            label={t("profile.pixKeys")} 
            onClick={() => setLocation("/pix-keys")}
          />
          <MenuItem 
            icon={Shield} 
            label={t("profile.security")} 
            onClick={() => setLocation("/security")}
          />
          <MenuItem icon={HelpCircle} label={t("profile.help")} />
          <LanguageToggle language={language} setLanguage={setLanguage} t={t} />
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/50 mt-4 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
          onClick={handleLogout}
          disabled={loggingOut}
          data-testid="button-logout"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          {t("profile.signOut")}
        </Button>
      </div>
      
      <BottomNav active="profile" />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, badge }: { icon: any, label: string, onClick?: () => void, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-card/40 hover:bg-card/70 border border-white/10 rounded-xl transition-all duration-300 group active:scale-[0.98] hover:shadow-lg hover:shadow-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary/20 transition-all duration-300 border border-white/5 group-hover:border-primary/30">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm">{label}</span>
        {badge && (
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-primary/30">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform group-hover:text-primary" />
    </button>
  );
}

function LanguageToggle({ language, setLanguage, t }: any) {
  return (
    <div className="w-full flex items-center justify-between p-3 bg-card/40 hover:bg-card/70 border border-white/10 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary/20 transition-all duration-300 border border-white/5 group-hover:border-primary/30">
          <Globe className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm">{t("profile.language")}</span>
      </div>
      <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
        <button 
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${language === "en" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
          data-testid="button-lang-en"
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage("pt-BR")}
          className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${language === "pt-BR" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
          data-testid="button-lang-pt"
        >
          PT
        </button>
      </div>
    </div>
  );
}
