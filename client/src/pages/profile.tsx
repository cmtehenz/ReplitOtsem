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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t("profile.title")}</h1>

        <div 
          className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setLocation("/personal-info")}
          data-testid="link-personal-info"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <span className="text-lg font-semibold text-primary">
                    {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900" data-testid="text-profile-name">
              {user?.name || user?.username || "User"}
            </h2>
            <p className="text-sm text-gray-500" data-testid="text-profile-email">
              {user?.email || ""}
            </p>
            {user?.verified && (
              <div className="flex items-center gap-1 mt-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full w-fit">
                <BadgeCheck className="w-3 h-3" />
                <span>{t("profile.verified")}</span>
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div 
          className="bg-primary/5 rounded-2xl p-4 cursor-pointer hover:bg-primary/10 transition-colors border border-primary/20"
          onClick={() => setLocation("/kyc")}
          data-testid="link-kyc"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">{t("profile.limits")}</h3>
              <p className="text-xs text-primary/70">{t("profile.upgradeButton")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary/50" />
          </div>
        </div>

        <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
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
          className="w-full h-12 text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl font-medium"
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
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

function LanguageToggle({ language, setLanguage, t }: any) {
  return (
    <div className="w-full flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <Globe className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <span className="font-medium text-gray-900">{t("profile.language")}</span>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <button 
          onClick={() => setLanguage("en")}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${language === "en" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          data-testid="button-lang-en"
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage("pt-BR")}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${language === "pt-BR" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          data-testid="button-lang-pt"
        >
          PT
        </button>
      </div>
    </div>
  );
}
