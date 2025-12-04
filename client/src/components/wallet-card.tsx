import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Wallet } from "lucide-react";
import { useState } from "react";
import bgImage from "@assets/generated_images/abstract_dark_purple_and_neon_green_3d_glass_waves_for_crypto_card_background.png";

export function WalletCard() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full aspect-[1.6/1] overflow-hidden rounded-[2.5rem] shadow-2xl group hover-scale"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 group-hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Overlay Gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-primary/20 z-10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 z-20 p-7 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-white/90">Otsem Wallet</span>
          </div>
          
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10 backdrop-blur-md active:scale-90"
          >
            {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-white/60 tracking-wide">Total Balance</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-display font-bold tracking-tight drop-shadow-lg">
              {isVisible ? "R$ 14.250,42" : "••••••••"}
            </h1>
          </div>
          {isVisible && (
            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 border border-green-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-xs font-bold text-green-300">+12.5%</span>
              </div>
              <span className="text-xs text-white/40 font-medium">this month</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Card Holder</span>
            <span className="text-sm font-medium tracking-wide font-display">ALEX MORGAN</span>
          </div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-8 opacity-90 brightness-0 invert drop-shadow-md" />
        </div>
      </div>
    </motion.div>
  );
}
