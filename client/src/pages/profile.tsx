import { User, Shield, CreditCard, LogOut, ChevronRight, HelpCircle, BadgeCheck, Users, Globe } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { useLanguage } from "@/context/LanguageContext";

export default function Profile() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-display font-bold tracking-tight">{t("profile.title")}</h1>

        {/* User Card */}
        <div className="glass-card rounded-3xl p-6 flex items-center gap-5 hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors shadow-lg">
              <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-bold font-display">Alex Morgan</h2>
            <p className="text-sm text-muted-foreground">alex.morgan@example.com</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#26A17B] bg-[#26A17B]/10 px-3 py-1 rounded-full w-fit border border-[#26A17B]/20">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span className="font-medium">{t("profile.verified")}</span>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-3xl p-5 border border-primary/20 cursor-pointer hover:bg-primary/5 transition-all active:scale-[0.98] group shadow-[0_0_20px_rgba(139,92,246,0.1)]" onClick={() => window.location.href = "/kyc"}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-primary font-display text-lg">{t("profile.limits")}</h3>
            <span className="text-xs bg-background/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 backdrop-blur-md border border-white/5">
              Level 2 <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">{t("profile.pixDeposit")}</span>
              <span>R$ 4.250 / R$ 50.000</span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-primary to-accent w-[8%] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            </div>
            <p className="text-xs text-primary/80 mt-2 text-center font-medium group-hover:text-primary transition-colors">{t("profile.upgradeButton")}</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          <MenuItem icon={User} label={t("profile.personalInfo")} />
          <MenuItem 
            icon={Users} 
            label={t("profile.referral")} 
            onClick={() => window.location.href = "/referral"}
            badge="Earn Money"
          />
          <MenuItem 
            icon={CreditCard} 
            label={t("profile.pixKeys")} 
            onClick={() => window.location.href = "/pix-keys"}
          />
          <MenuItem 
            icon={Shield} 
            label={t("profile.security")} 
            onClick={() => window.location.href = "/security"}
          />
          <MenuItem icon={HelpCircle} label={t("profile.help")} />
          <LanguageToggle language={language} setLanguage={setLanguage} t={t} />
        </div>

        <Button 
          variant="outline" 
          className="w-full h-16 text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/50 mt-6 rounded-2xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
          onClick={() => window.location.href = "/auth"}
        >
          <LogOut className="w-6 h-6 mr-2" />
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
      className="w-full flex items-center justify-between p-5 bg-card/40 hover:bg-card/70 border border-white/10 rounded-3xl transition-all duration-300 group active:scale-[0.98] shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-primary/30 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-bold text-lg">{label}</span>
        {badge && (
          <span className="text-[11px] bg-primary/20 text-primary px-3 py-1.5 rounded-full font-extrabold uppercase tracking-wider animate-pulse border border-primary/30 shadow-lg shadow-primary/20">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-2 transition-transform group-hover:text-primary" />
    </button>
  );
}

function LanguageToggle({ language, setLanguage, t }: any) {
  return (
    <div className="w-full flex items-center justify-between p-5 bg-card/40 hover:bg-card/70 border border-white/10 rounded-3xl transition-all duration-300 group shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-primary/30 shadow-inner">
          <Globe className="w-6 h-6" />
        </div>
        <span className="font-bold text-lg">{t("profile.language")}</span>
      </div>
      <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-xl border border-white/5">
        <button 
          onClick={() => setLanguage("en")}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${language === "en" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage("pt-BR")}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${language === "pt-BR" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"}`}
        >
          PT
        </button>
      </div>
    </div>
  );
}

