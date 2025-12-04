import { PageContainer } from "@/components/page-container";
import { Users, Copy, Share2, TrendingUp, DollarSign, ArrowUpRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";

export default function ReferralProgram() {
  const [, setLocation] = useLocation();
  const [commission, setCommission] = useState([2.5]);
  const [copied, setCopied] = useState(false);
  const referralCode = "ALEX2024";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">Referral Program</h1>
          <div className="w-10" />
        </div>

        <div className="space-y-8">
          {/* Hero Stats */}
          <div className="bg-gradient-to-br from-primary via-[#7c3aed] to-accent rounded-[2.5rem] p-1 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
             <div className="bg-background/90 backdrop-blur-xl rounded-[2.3rem] p-6 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Users className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-2">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Earnings</p>
                  <h2 className="text-5xl font-display font-bold text-white tracking-tight">R$ 1.240,50</h2>
                  <div className="inline-flex items-center gap-1.5 mt-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12% this week</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 relative z-10">
                  <div className="text-left p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <p className="text-xs text-muted-foreground font-medium">Invited Users</p>
                    <p className="text-2xl font-bold font-display">42</p>
                  </div>
                  <div className="text-left p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <p className="text-xs text-muted-foreground font-medium">Total Volume</p>
                    <p className="text-2xl font-bold font-display">R$ 45k</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Commission Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display font-bold text-lg">Your Commission</h3>
              <span className="text-2xl font-bold text-primary font-display">{commission}%</span>
            </div>
            <div className="glass-card rounded-3xl p-6 space-y-8 border border-white/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set your kickback rate. You earn up to 5% from every trade made by your referrals.
              </p>
              <div>
                <Slider 
                  value={commission} 
                  onValueChange={setCommission} 
                  max={5} 
                  step={0.1}
                  className="py-4" 
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono mt-2 font-medium">
                  <span>0%</span>
                  <span>2.5%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg px-1">Share your code</h3>
            <div className="flex gap-3">
              <div className="flex-1 glass-card border border-white/10 rounded-2xl p-4 flex items-center justify-center font-mono text-xl font-bold tracking-[0.2em] text-white">
                {referralCode}
              </div>
              <Button 
                onClick={handleCopy}
                className={cn(
                  "h-14 px-6 rounded-2xl transition-all w-20 font-bold shadow-lg hover:shadow-xl",
                  copied ? "bg-green-500 text-white shadow-green-500/25 hover:shadow-green-500/40" : "bg-white/10 text-white hover:bg-white/20 shadow-white/10"
                )}
              >
                {copied ? <Check className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
              </Button>
            </div>
            <Button className="w-full h-16 bg-gradient-to-r from-primary to-[#7c3aed] text-white hover:shadow-lg hover:shadow-primary/30 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              <Share2 className="w-6 h-6 mr-2" />
              Invite Friends
            </Button>
          </div>

          {/* Recent Earnings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display font-bold text-lg">Recent Earnings</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/15 hover:text-primary font-bold h-12 px-4 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all">
                    Withdraw <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-center font-display text-xl">Withdraw Earnings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="bg-background/50 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Available</span>
                      <span className="font-bold text-2xl font-display text-white">R$ 1.240,50</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed text-center">
                      Minimum withdrawal amount is R$ 50,00. Funds are sent to your main wallet instantly.
                    </p>
                    <Button className="w-full h-14 bg-gradient-to-r from-primary to-[#7c3aed] text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95">Confirm Withdrawal</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl glass-card border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B] border border-[#26A17B]/20">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Commission Earned</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">From User_8492 • Trade Volume R$ 1.2k</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#26A17B]">+R$ 15,40</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
