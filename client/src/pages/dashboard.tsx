import { WalletCard } from "@/components/wallet-card";
import { ActionButtons } from "@/components/pix-actions";
import { AssetList } from "@/components/asset-list";
import { TransactionHistory } from "@/components/transaction-history";
import { Bell, Settings, Menu } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 p-0.5">
              <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back,</p>
              <p className="text-sm font-medium font-display">Alex Morgan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pt-6 space-y-8">
        <WalletCard />
        <ActionButtons />
        <AssetList />
        <TransactionHistory />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          <NavButton icon={Menu} label="Home" active />
          <NavButton icon={Menu} label="Wallet" />
          <div className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(50,188,173,0.4)] border-4 border-background cursor-pointer hover:scale-105 transition-transform">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Pix_logo_2020.svg/2560px-Pix_logo_2020.svg.png" className="w-8 h-8 invert brightness-0" alt="Pix" />
          </div>
          <NavButton icon={Menu} label="Stats" />
          <NavButton icon={Menu} label="Cards" />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  // Using simple placeholders for icons since I don't want to import all of them right now
  // In a real app, these would be specific icons (Home, Wallet, BarChart, CreditCard)
  return (
    <button className={cn(
      "flex flex-col items-center gap-1 w-16 py-1 transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-white"
    )}>
      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
        {/* Placeholder shape */}
        <div className={cn("w-3 h-3 rounded-sm", active ? "bg-primary" : "bg-muted-foreground")} />
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
