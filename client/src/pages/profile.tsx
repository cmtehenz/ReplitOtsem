import { User as UserIcon, Shield, CreditCard, LogOut, ChevronRight, HelpCircle, BadgeCheck, Users, Globe, Loader2, Sparkles } from "lucide-react";
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
      <div className="max-w-md mx-auto px-5 py-8 space-y-6">
        <h1 className="text-2xl font-display font-bold tracking-tight">{t("profile.title")}</h1>

        <div 
          className="premium-card rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-all duration-200 cursor-pointer group"
          onClick={() => setLocation("/personal-info")}
          data-testid="link-personal-info"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/[0.1] p-0.5 group-hover:border-primary/40 transition-all duration-200 bg-white/[0.03]">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-semibold font-display" data-testid="text-profile-name">
              {user?.name || user?.username || "User"}
            </h2>
            <p className="text-xs text-muted-foreground/70" data-testid="text-profile-email">
              {user?.email || ""}
            </p>
            {user?.verified && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit border border-emerald-500/20 uppercase font-semibold tracking-wider">
                <BadgeCheck className="w-3 h-3" />
                <span>{t("profile.verified")}</span>
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-1 transition-transform group-hover:text-primary" />
        </div>

        <div 
          className="relative overflow-hidden rounded-2xl p-5 cursor-pointer hover:bg-primary/[0.08] transition-all duration-200 active:scale-[0.99] group border border-primary/20"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)' }}
          onClick={() => setLocation("/kyc")}
          data-testid="link-kyc"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary font-display text-base">{t("profile.limits")}</h3>
              <p className="text-[11px] text-primary/60 mt-0.5">{t("profile.upgradeButton")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary/60 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="space-y-2">
          <MenuItem 
            icon={UserIcon} 
            label={t("profile.personalInfo")} 
            onClick={() => setLocation("/personal-info")}
          />
          <MenuItem 
            icon={Users} 
            label={t("profile.referral")} 
            onClick={() => setLocation("/referral")}
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
          <MenuItem 
            icon={HelpCircle} 
            label={t("profile.help")} 
            onClick={() => window.open("mailto:support@otsem.com", "_blank")}
          />
          <LanguageToggle language={language} setLanguage={setLanguage} t={t} />
        </div>

        <Button 
          variant="outline" 
          className="w-full h-13 text-red-400 border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/40 mt-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.99]"
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

function MenuItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl transition-all duration-200 group active:scale-[0.99]"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-muted-foreground/60 group-hover:text-foreground group-hover:bg-primary/10 transition-all duration-200 border border-white/[0.04] group-hover:border-primary/20">
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-1 transition-transform group-hover:text-primary" />
    </button>
  );
}

function LanguageToggle({ language, setLanguage, t }: any) {
  return (
    <div className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl transition-all duration-200 group">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-muted-foreground/60 group-hover:text-foreground group-hover:bg-primary/10 transition-all duration-200 border border-white/[0.04] group-hover:border-primary/20">
          <Globe className="w-[18px] h-[18px]" strokeWidth={2} />
        </div>
        <span className="font-medium text-sm">{t("profile.language")}</span>
      </div>
      <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.04]">
        <button 
          onClick={() => setLanguage("en")}
          className={`px-3 py-1.5 rounded-lg font-semibold text-[10px] transition-all tracking-wide ${language === "en" ? "bg-primary text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)]" : "text-muted-foreground/60 hover:text-foreground"}`}
          data-testid="button-lang-en"
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage("pt-BR")}
          className={`px-3 py-1.5 rounded-lg font-semibold text-[10px] transition-all tracking-wide ${language === "pt-BR" ? "bg-primary text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)]" : "text-muted-foreground/60 hover:text-foreground"}`}
          data-testid="button-lang-pt"
        >
          PT
        </button>
      </div>
    </div>
  );
}
