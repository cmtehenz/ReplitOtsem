import { motion } from "framer-motion";
import { ArrowLeft, Lock, Smartphone, Key, History, ChevronRight, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";

export default function Security() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => setLocation("/profile")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center pr-4">
          <h1 className="font-display font-bold text-lg">Security</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-8">
        
        {/* 2FA Status */}
        <div className="bg-gradient-to-br from-primary/20 to-background border border-primary/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">High Security</h3>
            <p className="text-xs text-muted-foreground">Your account is protected with 2FA.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Authentication</h2>
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth (2FA)</p>
                    <p className="text-xs text-muted-foreground">Google Authenticator</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Biometric Login</p>
                    <p className="text-xs text-muted-foreground">FaceID / TouchID</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Change Password</p>
                    <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Activity</h2>
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Login History</p>
                    <p className="text-xs text-muted-foreground">View recent devices</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full h-12 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out of All Devices
        </Button>
      </div>
    </div>
  );
}
