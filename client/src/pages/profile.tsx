import { User, Shield, CreditCard, LogOut, ChevronRight, HelpCircle, BadgeCheck, Users } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

export default function Profile() {
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-display font-bold tracking-tight">Profile</h1>

        {/* User Card */}
        <div className="glass-card rounded-3xl p-6 flex items-center gap-5 hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors shadow-lg">
              <img src={avatar} alt="User" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-bold font-display">Alex Morgan</h2>
            <p className="text-sm text-muted-foreground">alex.morgan@example.com</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#26A17B] bg-[#26A17B]/10 px-3 py-1 rounded-full w-fit border border-[#26A17B]/20">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span className="font-medium">Verified Level 2</span>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-3xl p-5 border border-primary/20 cursor-pointer hover:bg-primary/5 transition-all active:scale-[0.98] group shadow-[0_0_20px_rgba(139,92,246,0.1)]" onClick={() => window.location.href = "/kyc"}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-primary font-display text-lg">Daily Limits</h3>
            <span className="text-xs bg-background/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 backdrop-blur-md border border-white/5">
              Level 2 <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Pix Deposit</span>
              <span>R$ 4.250 / R$ 50.000</span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-primary to-accent w-[8%] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            </div>
            <p className="text-xs text-primary/80 mt-2 text-center font-medium group-hover:text-primary transition-colors">Tap to upgrade limits</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
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
          className="w-full h-14 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 mt-4 rounded-2xl font-bold text-base transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          onClick={() => window.location.href = "/auth"}
        >
          <LogOut className="w-5 h-5 mr-2" />
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
      className="w-full flex items-center justify-between p-4 bg-card/40 hover:bg-card/60 border border-white/5 rounded-2xl transition-all duration-300 group active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-primary/20">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-base">{label}</span>
        {badge && (
          <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wide animate-pulse border border-primary/20">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform group-hover:text-primary" />
    </button>
  );
}
