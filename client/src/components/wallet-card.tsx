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
      transition={{ duration: 0.5 }}
      className="relative w-full aspect-[1.8/1] overflow-hidden rounded-[2rem] shadow-2xl border border-white/10 group"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Overlay Gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium tracking-wide opacity-90">Main Wallet</span>
          </div>
          
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
          >
            {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-white/70">Total Balance</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              {isVisible ? "R$ 14.250,42" : "••••••••"}
            </h1>
          </div>
          {isVisible && (
            <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 w-fit px-2 py-0.5 rounded-md backdrop-blur-md border border-primary/20">
              <span>+R$ 1.240,00 (12%)</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-white/60">Account Holder</span>
            <span className="text-sm font-medium">Alex Morgan</span>
          </div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-8 opacity-80 invert brightness-0" />
        </div>
      </div>
    </motion.div>
  );
}
