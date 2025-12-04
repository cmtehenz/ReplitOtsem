import { WalletCard } from "@/components/wallet-card";
import { ActionGrid } from "@/components/action-grid";
import { ExchangeCard } from "@/components/exchange-card";
import { AssetList } from "@/components/asset-list";
import { TransactionHistory } from "@/components/transaction-history";
import { Bell, Settings, Menu, ArrowLeftRight, Wallet, TrendingUp } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { cn } from "@/lib/utils";
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
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors">
                <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Welcome back,</p>
              <p className="text-sm font-bold font-display tracking-wide group-hover:text-primary transition-colors">Alex Morgan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30 relative group"
              onClick={() => setLocation("/notifications")}
            >
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border border-background" />
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30 group" 
              onClick={() => setLocation("/profile")}
            >
              <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pt-6 space-y-10">
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
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 pb-safe z-50 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-4">
          <NavButton icon={Menu} label="Home" active={true} onClick={() => setLocation("/")} />
          <NavButton icon={Wallet} label="Wallet" onClick={() => setLocation("/wallet")} />
          <div 
            className="relative -top-6 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="absolute inset-0 bg-primary blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-[#7c3aed] rounded-2xl rotate-45 flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <ArrowLeftRight className="w-7 h-7 text-white -rotate-45" />
            </div>
          </div>
          <NavButton icon={TrendingUp} label="Stats" onClick={() => setLocation("/stats")} />
          <NavButton icon={Menu} label="Cards" onClick={() => setLocation("/cards")} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 w-16 py-2 transition-all duration-300",
        active ? "text-primary" : "text-muted-foreground hover:text-white"
      )}
    >
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-300",
        active ? "text-primary scale-110" : ""
      )}>
        <Icon className={cn("w-6 h-6", active && "fill-current opacity-20")} />
        {active && <Icon className="w-6 h-6 absolute inset-0" />}
      </div>
      <span className={cn("text-[10px] font-medium tracking-wide", active ? "font-bold" : "")}>{label}</span>
    </button>
  );
}
