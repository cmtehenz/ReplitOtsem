import { motion } from "framer-motion";
import { Users, Copy, Share2, TrendingUp, Wallet, ChevronRight, DollarSign, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="p-6 flex items-center border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <button 
          onClick={() => setLocation("/profile")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display font-bold text-lg">Referral Program</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-primary/20 to-background border border-primary/20 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Users className="w-24 h-24 text-primary" />
          </div>
          
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Earnings</p>
            <h2 className="text-4xl font-display font-bold text-white mt-1">R$ 1.240,50</h2>
            <div className="inline-flex items-center gap-1 mt-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this week</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 relative z-10">
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Invited Users</p>
              <p className="text-xl font-bold">42</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Total Volume</p>
              <p className="text-xl font-bold">R$ 45k</p>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-lg">Your Commission</h3>
            <span className="text-2xl font-bold text-primary">{commission}%</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Set your commission fee on top of our base fee. You can earn up to 5% from every trade made by your referrals.
          </p>
          <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-6">
            <Slider 
              value={commission} 
              onValueChange={setCommission} 
              max={5} 
              step={0.1}
              className="py-4" 
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>0%</span>
              <span>2.5%</span>
              <span>5%</span>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-4">
          <h3 className="font-display font-medium text-lg">Share your code</h3>
          <div className="flex gap-3">
            <div className="flex-1 bg-card border border-white/5 rounded-xl p-4 flex items-center justify-between font-mono text-lg font-bold tracking-widest">
              {referralCode}
            </div>
            <Button 
              onClick={handleCopy}
              className={cn(
                "h-auto px-6 rounded-xl transition-all",
                copied ? "bg-green-500 text-white" : "bg-secondary text-white hover:bg-white/10"
              )}
            >
              {copied ? <span className="font-bold">Copied!</span> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium text-lg">
            <Share2 className="w-5 h-5 mr-2" />
            Invite Friends
          </Button>
        </div>

        {/* Recent Earnings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-lg">Recent Earnings</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                  Withdraw <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Withdraw Earnings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-background/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-bold text-xl">R$ 1.240,50</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Withdrawals are processed every Tuesday. Minimum withdrawal amount is R$ 50,00.
                  </p>
                  <Button className="w-full bg-primary text-primary-foreground">Request Withdrawal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-card/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Commission Earned</p>
                    <p className="text-xs text-muted-foreground">From User_8492 • Trade Volume R$ 1.2k</p>
                  </div>
                </div>
                <span className="font-bold text-[#26A17B]">+R$ 15,40</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
