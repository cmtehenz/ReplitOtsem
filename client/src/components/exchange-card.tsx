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
    <div className="glass-card rounded-3xl p-6 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-medium">Exchange</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">
          <Info className="w-3 h-3" />
          <span>1 USDT ≈ R$ {usdtRate.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* From Input */}
        <div className="bg-background/50 border border-white/5 rounded-2xl p-4 space-y-2 transition-colors focus-within:border-primary/30">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>You pay</span>
            <span>Balance: {mode === "buy" ? "R$ 4.250,00" : "1,420.00 USDT"}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-2xl font-medium focus:outline-none w-full placeholder:text-muted-foreground/30"
            />
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl shrink-0">
              {mode === "buy" ? (
                <span className="w-6 h-6 flex items-center justify-center text-lg">🇧🇷</span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-lg bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              )}
              <span className="font-medium">{fromCurrency}</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-4 relative z-10">
          <button 
            onClick={handleSwap}
            className="bg-card border border-white/10 p-2 rounded-xl hover:border-primary/50 hover:text-primary transition-all shadow-lg"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        {/* To Input */}
        <div className="bg-background/50 border border-white/5 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>You receive</span>
            <span>Estimated</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={calculateOutput()}
              readOnly
              placeholder="0.00"
              className="bg-transparent text-2xl font-medium focus:outline-none w-full placeholder:text-muted-foreground/30 text-primary"
            />
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl shrink-0">
              {mode === "buy" ? (
                <span className="w-6 h-6 flex items-center justify-center text-lg bg-[#26A17B] rounded-full text-white font-bold text-[10px]">T</span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-lg">🇧🇷</span>
              )}
              <span className="font-medium">{toCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      <Button className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium shadow-[0_0_20px_rgba(50,188,173,0.2)]">
        {mode === "buy" ? "Buy USDT" : "Sell USDT"}
      </Button>
    </div>
  );
}
