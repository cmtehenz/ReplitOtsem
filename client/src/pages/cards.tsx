import { motion } from "framer-motion";
import { CreditCard, Wifi, Lock, Eye, EyeOff, Copy, Plus, Menu, Wallet, TrendingUp, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Cards() {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl">Cards</h1>

        {/* Card Visual */}
        <div className="relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl group perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent p-6 flex flex-col justify-between text-primary-foreground">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
                <span className="font-display font-bold tracking-wider">PixVault</span>
              </div>
              <Wifi className="w-6 h-6 opacity-80 rotate-90" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="font-mono text-xl tracking-widest">
                    {showDetails ? "4829 1029 4829 1023" : "•••• •••• •••• 1023"}
                  </p>
                  <button onClick={() => setShowDetails(!showDetails)} className="opacity-80 hover:opacity-100">
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase opacity-80">Card Holder</p>
                    <p className="font-medium tracking-wide">ALEX MORGAN</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase opacity-80 text-right">Expires</p>
                    <p className="font-medium tracking-wide">12/28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Card Controls */}
        <div className="grid grid-cols-4 gap-4">
          <ControlBtn icon={Lock} label="Freeze" />
          <ControlBtn icon={Eye} label="Show PIN" />
          <ControlBtn icon={Copy} label="Copy # " />
          <ControlBtn icon={Plus} label="Top Up" />
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Card Settings</h3>
          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
             <SettingItem label="Online Payments" enabled />
             <SettingItem label="Contactless" enabled />
             <SettingItem label="ATM Withdrawals" enabled={false} />
             <SettingItem label="International Usage" enabled />
          </div>
        </div>
      </div>

      <BottomNav active="cards" />
    </div>
  );
}

function ControlBtn({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
      <div className="w-14 h-14 rounded-2xl bg-card border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors shadow-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </button>
  );
}

function SettingItem({ label, enabled }: { label: string, enabled: boolean }) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer">
      <span className="font-medium">{label}</span>
      <div className={cn("w-10 h-6 rounded-full p-1 transition-colors", enabled ? "bg-primary" : "bg-white/10")}>
        <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform", enabled ? "translate-x-4" : "translate-x-0")} />
      </div>
    </div>
  );
}

// Bottom Nav Component (Duplicated for now)
function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <NavButton icon={Menu} label="Home" active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={Wallet} label="Wallet" active={active === "wallet"} onClick={() => setLocation("/wallet")} />
        <div 
          className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(50,188,173,0.4)] border-4 border-background cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setLocation("/")}
        >
          <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
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
