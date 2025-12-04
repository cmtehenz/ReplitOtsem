import { Menu, Wallet, Newspaper, ArrowLeftRight, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0812]/95 backdrop-blur-2xl border-t border-white/[0.04] pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
        <NavButton icon={Menu} label={t("nav.home")} active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={Wallet} label={t("nav.wallet")} active={active === "wallet"} onClick={() => setLocation("/wallet")} />
        <div 
          className="relative -top-5 group cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <div className="absolute inset-0 bg-primary blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 scale-150" />
          <div className="relative w-[52px] h-[52px] bg-gradient-to-br from-primary via-[#8b5cf6] to-[#7c3aed] rounded-2xl rotate-45 flex items-center justify-center shadow-[0_4px_24px_rgba(139,92,246,0.4)] border border-white/20 group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
            <ArrowLeftRight className="w-6 h-6 text-white -rotate-45" strokeWidth={2.5} />
          </div>
        </div>
        <NavButton icon={Newspaper} label={t("nav.feed")} active={active === "feed"} onClick={() => setLocation("/feed")} />
        <NavButton icon={CreditCard} label={t("nav.card")} active={active === "cards"} onClick={() => setLocation("/cards")} />
      </div>
    </nav>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 w-16 py-2 transition-all duration-200",
        active ? "text-primary" : "text-muted-foreground/60 hover:text-foreground/80"
      )}
    >
      <div className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
        active ? "bg-primary/10" : "hover:bg-white/[0.04]"
      )}>
        <Icon className={cn("w-5 h-5", active && "text-primary")} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={cn(
        "text-[10px] font-medium tracking-wide transition-colors",
        active ? "text-primary font-semibold" : ""
      )}>{label}</span>
    </button>
  );
}
