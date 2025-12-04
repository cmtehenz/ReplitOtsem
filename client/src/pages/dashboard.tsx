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
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => setLocation("/profile")}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 p-0.5 cursor-pointer">
              <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="cursor-pointer">
              <p className="text-xs text-muted-foreground">Welcome back,</p>
              <p className="text-sm font-medium font-display">Alex Morgan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
              onClick={() => setLocation("/notifications")}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors" onClick={() => setLocation("/profile")}>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pt-6 space-y-8">
        {/* Total Balance Card */}
        <WalletCard />
        
        {/* Quick Actions (Deposit Pix, Deposit USDT, Withdraw) */}
        <ActionGrid />

        {/* Exchange Interface */}
        <ExchangeCard />
        
        {/* Asset Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-display font-medium">Your Balances</h3>
            <button onClick={() => setLocation("/wallet")} className="text-sm text-primary hover:underline">View all</button>
          </div>
          <AssetList />
        </div>
        
        {/* History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-display font-medium">Recent Activity</h3>
            <button onClick={() => setLocation("/activity")} className="text-sm text-primary hover:underline">View all</button>
          </div>
          <TransactionHistory />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          <NavButton icon={Menu} label="Home" active={true} onClick={() => setLocation("/")} />
          <NavButton icon={Wallet} label="Wallet" onClick={() => setLocation("/wallet")} />
          <div 
            className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(50,188,173,0.4)] border-4 border-background cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
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
        "flex flex-col items-center gap-1 w-16 py-1 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-white"
      )}
    >
      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
        <div className={cn("w-3 h-3 rounded-sm", active ? "bg-primary" : "bg-muted-foreground")} />
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
