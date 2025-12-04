import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Lock, Smartphone, Key, History, ChevronRight, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";

export default function Security() {
  const [, setLocation] = useLocation();

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">Security Center</h1>
          <div className="w-10" />
        </div>
        
        {/* 2FA Status */}
        <div className="bg-gradient-to-br from-primary via-[#7c3aed] to-accent p-[1px] rounded-3xl shadow-[0_0_30px_rgba(139,92,246,0.15)]">
          <div className="bg-background/95 backdrop-blur-xl rounded-[23px] p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg font-display">High Security</h3>
              <p className="text-sm text-muted-foreground">Your account is fully protected with 2FA enabled.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Authentication</h2>
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
              <div className="p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Two-Factor Auth</p>
                    <p className="text-xs text-muted-foreground">Google Authenticator</p>
                  </div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              
              <div className="p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Biometric Login</p>
                    <p className="text-xs text-muted-foreground">FaceID / TouchID</p>
                  </div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>

              <button className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                    <Key className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Change Password</p>
                    <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Activity</h2>
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
              <button className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                    <History className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Login History</p>
                    <p className="text-xs text-muted-foreground">View recent devices and locations</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-14 rounded-2xl text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 font-bold text-base mt-auto"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out of All Devices
        </Button>
      </div>
    </PageContainer>
  );
}
