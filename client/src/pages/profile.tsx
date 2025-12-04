import { motion } from "framer-motion";
import { User, Shield, CreditCard, LogOut, ChevronRight, HelpCircle, BadgeCheck, Users } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Menu, ArrowLeftRight } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-display font-bold">Profile</h1>

        {/* User Card */}
        <div className="bg-card border border-white/5 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 p-0.5">
            <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Alex Morgan</h2>
            <p className="text-sm text-muted-foreground">alex.morgan@example.com</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-[#26A17B] bg-[#26A17B]/10 px-2 py-0.5 rounded-full w-fit">
              <BadgeCheck className="w-3 h-3" />
              <span>Verified Level 2</span>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-4 border border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => window.location.href = "/kyc"}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-primary">Daily Limits</h3>
            <span className="text-xs bg-background/50 px-2 py-1 rounded-md flex items-center gap-1">
              Level 2 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pix Deposit</span>
              <span>R$ 4.250 / R$ 50.000</span>
            </div>
            <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[8%]" />
            </div>
            <p className="text-xs text-primary/80 mt-2 text-center font-medium">Tap to upgrade limits</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuItem icon={User} label="Personal Information" />
          <MenuItem 
            icon={Users} 
            label="Referral Program" 
            onClick={() => window.location.href = "/referral"}
            badge="Earn Money"
          />
          <MenuItem 
            icon={CreditCard} 
            label="Saved Pix Keys" 
            onClick={() => window.location.href = "/pix-keys"}
          />
          <MenuItem 
            icon={Shield} 
            label="Security & 2FA" 
            onClick={() => window.location.href = "/security"}
          />
          <MenuItem icon={HelpCircle} label="Help & Support" />
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 mt-4"
          onClick={() => window.location.href = "/auth"}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      <BottomNav active="profile" />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, badge }: { icon: any, label: string, onClick?: () => void, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-card/30 hover:bg-card border border-white/5 rounded-xl transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium">{label}</span>
        {badge && (
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wide animate-pulse">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

// Reusing Bottom Nav for now (should be a component)
function BottomNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <NavButton icon={Menu} label="Home" active={active === "home"} onClick={() => setLocation("/")} />
        <NavButton icon={Menu} label="Wallet" active={active === "wallet"} onClick={() => setLocation("/wallet")} />
        <div 
          className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(50,188,173,0.4)] border-4 border-background cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setLocation("/")}
        >
          <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
        </div>
        <NavButton icon={Menu} label="Activity" active={active === "activity"} onClick={() => setLocation("/activity")} />
        <NavButton icon={Menu} label="Profile" active={active === "profile"} onClick={() => setLocation("/profile")} />
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
