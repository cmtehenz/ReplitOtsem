import { Menu, Wallet, TrendingUp, ArrowLeftRight } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 pb-safe z-50 backdrop-blur-xl">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-4">
        <NavButton icon={Menu} label="Home" active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={Wallet} label="Wallet" active={active === "wallet"} onClick={() => setLocation("/wallet")} />
        <div 
          className="relative -top-6 group cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <div className="absolute inset-0 bg-primary blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-[#7c3aed] rounded-2xl rotate-45 flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
            <ArrowLeftRight className="w-7 h-7 text-white -rotate-45" />
          </div>
        </div>
        <NavButton icon={TrendingUp} label="Stats" active={active === "stats"} onClick={() => setLocation("/stats")} />
        <NavButton icon={Menu} label="Cards" active={active === "cards"} onClick={() => setLocation("/cards")} />
      </div>
    </nav>
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
