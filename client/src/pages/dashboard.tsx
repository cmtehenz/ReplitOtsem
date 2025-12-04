import { BottomNav } from "@/components/bottom-nav";
import { WalletCard } from "@/components/wallet-card";
import { ActionGrid } from "@/components/action-grid";
import { ExchangeCard } from "@/components/exchange-card";
import { AssetList } from "@/components/asset-list";
import { TransactionHistory } from "@/components/transaction-history";
import { NotificationBell } from "@/components/notification-bell";
import { Settings, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setLocation("/profile")}>
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/[0.1] p-0.5 group-hover:border-primary/40 transition-all duration-200 bg-white/[0.03]">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary/70" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-[0.15em]">
                {t("nav.home") === "Início" ? "Bem-vindo" : "Welcome back"}
              </p>
              <p className="text-sm font-semibold font-display tracking-wide group-hover:text-primary transition-colors" data-testid="text-username">
                {user?.name || user?.username || "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button 
              className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 border border-white/[0.06] hover:border-white/[0.12] group" 
              onClick={() => setLocation("/profile")}
              data-testid="button-settings"
            >
              <Settings className="w-[18px] h-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-6 space-y-8">
        <section>
          <WalletCard />
        </section>
        
        <section className="py-1">
          <ActionGrid />
        </section>

        <section>
          <ExchangeCard />
        </section>
        
        <section>
          <AssetList />
        </section>
        
        <section>
          <TransactionHistory />
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
