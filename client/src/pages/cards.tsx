import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Wifi, Lock, Eye, EyeOff, Copy, Plus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Cards() {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl">Cards</h1>

        {/* Card Visual */}
        <div className="relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl group perspective-1000 hover-scale">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#7c3aed] to-accent p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
                <span className="font-display font-bold tracking-wider text-lg">Otsem Pay</span>
              </div>
              <Wifi className="w-6 h-6 opacity-80 rotate-90" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-9 bg-white/20 rounded-md backdrop-blur-md border border-white/10" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-mono text-xl tracking-widest drop-shadow-md">
                    {showDetails ? "4829 1029 4829 1023" : "•••• •••• •••• 1023"}
                  </p>
                  <button onClick={() => setShowDetails(!showDetails)} className="opacity-80 hover:opacity-100 transition-opacity">
                    {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-between items-end text-sm">
                  <div>
                    <p className="text-[10px] uppercase opacity-80 mb-0.5">Card Holder</p>
                    <p className="font-medium tracking-wide font-display">ALEX MORGAN</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase opacity-80 mb-0.5">Expires</p>
                    <p className="font-medium tracking-wide font-display">12/28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform ease-in-out" />
        </div>

        {/* Card Controls */}
        <div className="grid grid-cols-4 gap-4">
          <ControlBtn icon={Lock} label="Freeze" />
          <ControlBtn icon={Eye} label="Show PIN" />
          <ControlBtn icon={Copy} label="Copy #" />
          <ControlBtn icon={Plus} label="Top Up" />
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="font-display font-medium text-lg">Card Settings</h3>
          <div className="glass-card rounded-3xl overflow-hidden">
             <SettingItem label="Online Payments" enabled />
             <SettingItem label="Contactless Payments" enabled />
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
    <button className="flex flex-col items-center gap-3 group">
      <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 shadow-lg border border-white/5 group-hover:border-primary/30">
        <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </button>
  );
}

function SettingItem({ label, enabled }: { label: string, enabled: boolean }) {
  return (
    <div className="p-5 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
      <span className="font-medium text-sm group-hover:text-white transition-colors">{label}</span>
      <div className={cn("w-11 h-6 rounded-full p-1 transition-colors duration-300", enabled ? "bg-primary" : "bg-white/10")}>
        <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300", enabled ? "translate-x-5" : "translate-x-0")} />
      </div>
    </div>
  );
}
