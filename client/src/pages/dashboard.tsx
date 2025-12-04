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
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setLocation("/profile")}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {t("nav.home") === "Início" ? "Bem-vindo" : "Welcome back"}
              </p>
              <p className="text-sm font-bold font-display tracking-wide group-hover:text-primary transition-colors" data-testid="text-username">
                {user?.name || user?.username || "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30 group" 
              onClick={() => setLocation("/profile")}
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-2 space-y-8">
        <section>
          <WalletCard />
        </section>
        
        <section className="py-2">
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
