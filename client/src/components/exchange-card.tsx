import { useState } from "react";
import { ArrowDown, ArrowUpDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ExchangeCard() {
  const [mode, setMode] = useState<"buy" | "sell">("buy"); // buy USDT or sell USDT
  const [amount, setAmount] = useState("");
  
  // Mock exchange rate
  const usdtRate = 5.15; // 1 USDT = 5.15 BRL

  const fromCurrency = mode === "buy" ? "BRL" : "USDT";
  const toCurrency = mode === "buy" ? "USDT" : "BRL";
  
  const calculateOutput = () => {
    if (!amount) return "";
    const val = parseFloat(amount);
    if (isNaN(val)) return "";
    
    if (mode === "buy") {
      return (val / usdtRate).toFixed(2);
    } else {
      return (val * usdtRate).toFixed(2);
    }
  };

  const handleSwap = () => {
    setMode(mode === "buy" ? "sell" : "buy");
    setAmount("");
  };

  return (
    <div id="exchange-section" className="glass-card rounded-3xl p-5 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-medium">Exchange</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">
          <Info className="w-3 h-3" />
          <span>1 USDT ≈ R$ {usdtRate.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-1">
        {/* From Input */}
        <div className="bg-background/50 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">You Pay</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-lg font-medium focus:outline-none w-24 placeholder:text-muted-foreground/30"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
            {mode === "buy" ? (
              <span className="w-5 h-5 flex items-center justify-center text-sm">🇧🇷</span>
            ) : (
              <span className="w-5 h-5 flex items-center justify-center text-sm bg-[#26A17B] rounded-full text-white font-bold text-[8px]">T</span>
            )}
            <span className="text-sm font-medium">{fromCurrency}</span>
          </div>
        </div>

        {/* To Input */}
        <div className="bg-background/50 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
             <span className="text-[10px] text-muted-foreground uppercase tracking-wider">You Receive</span>
            <input
              type="text"
              value={calculateOutput()}
              readOnly
              placeholder="0.00"
              className="bg-transparent text-lg font-medium focus:outline-none w-24 placeholder:text-muted-foreground/30 text-primary"
            />
          </div>
           <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
            {mode === "buy" ? (
               <span className="w-5 h-5 flex items-center justify-center text-sm bg-[#26A17B] rounded-full text-white font-bold text-[8px]">T</span>
            ) : (
               <span className="w-5 h-5 flex items-center justify-center text-sm">🇧🇷</span>
            )}
            <span className="text-sm font-medium">{toCurrency}</span>
          </div>
        </div>
      </div>
      
       <div className="flex gap-2">
        <button 
            onClick={handleSwap}
            className="bg-card border border-white/10 p-3 rounded-xl hover:border-primary/50 hover:text-primary transition-all"
          >
            <ArrowUpDown className="w-5 h-5" />
        </button>
        <Button 
          className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium shadow-md"
          onClick={() => window.location.href = "/exchange-success"}
        >
          {mode === "buy" ? "Buy USDT" : "Sell USDT"}
        </Button>
      </div>
    </div>
  );
}
