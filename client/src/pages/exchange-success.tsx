import { motion } from "framer-motion";
import { CheckCircle2, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";

export default function ExchangeSuccess() {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} colors={['#26A17B', '#8B5CF6', '#ffffff']} />}

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-sm w-full text-center space-y-8 relative z-10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary relative z-10">
            <CheckCircle2 className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold">Exchange Successful!</h1>
          <p className="text-muted-foreground">
            You successfully converted <br />
            <span className="text-white font-medium">R$ 500,00</span> to <span className="text-[#26A17B] font-medium">97.08 USDT</span>
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium">1 USDT = R$ 5,15</span>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fee</span>
            <span className="font-medium">R$ 2,50 (0.5%)</span>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-xs">#EX-8923-2025</span>
          </div>
        </div>

        <div className="space-y-3 w-full">
          <Button 
            onClick={() => setLocation("/")}
            className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            Back to Home
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg border-white/10 hover:bg-white/5 rounded-xl"
            onClick={() => setLocation("/activity")}
          >
            View Receipt
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
