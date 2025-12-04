import { Menu, LayoutGrid, ArrowLeftRight, BarChart2, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 px-8 pointer-events-none">
      <div className="max-w-[320px] mx-auto bg-white/80 backdrop-blur-xl border border-white/50 shadow-floating rounded-[1.5rem] h-16 flex justify-between items-center px-6 pointer-events-auto">
        <NavButton icon={LayoutGrid} active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={ArrowLeftRight} active={active === "swap"} onClick={() => setLocation("/swap")} />
        <NavButton icon={BarChart2} active={active === "stats"} onClick={() => setLocation("/stats")} />
        <NavButton icon={Settings} active={active === "settings"} onClick={() => setLocation("/settings")} />
      </div>
    </nav>
  );
}

function NavButton({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300",
        active ? "text-black bg-black/5" : "text-gray-400 hover:text-gray-600 hover:bg-black/5"
      )}
    >
      <Icon className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
}
