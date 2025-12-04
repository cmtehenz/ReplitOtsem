import { BottomNav } from "@/components/bottom-nav";
import { WalletCard } from "@/components/wallet-card";
import { ActionGrid } from "@/components/action-grid";
import { ExchangeCard } from "@/components/exchange-card";
import { AssetList } from "@/components/asset-list";
import { TransactionHistory } from "@/components/transaction-history";
import { Bell, Settings } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setLocation("/profile")}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors">
                <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Welcome back</p>
              <p className="text-sm font-bold font-display tracking-wide group-hover:text-primary transition-colors">Alex Morgan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30 relative group"
              onClick={() => setLocation("/notifications")}
            >
              <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border border-background" />
            </button>
            <button 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30 group" 
              onClick={() => setLocation("/profile")}
            >
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[92%] md:max-w-md mx-auto pt-4 space-y-6 pb-24">
        {/* Total Balance Card */}
        <section>
          <WalletCard />
        </section>
        
        {/* Quick Actions (Deposit Pix, Deposit USDT, Withdraw) */}
        <section>
          <ActionGrid />
        </section>

        {/* Exchange Interface */}
        <section>
          <ExchangeCard />
        </section>
        
        {/* Asset Breakdown */}
        <section>
          <AssetList />
        </section>
        
        {/* History */}
        <section>
          <TransactionHistory />
        </section>
      </main>

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );
}
