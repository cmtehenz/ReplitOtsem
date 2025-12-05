import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Wifi, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Cards() {
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 flex flex-col h-full">
        <h1 className="font-display font-bold text-2xl mb-12">{t("cards.title")}</h1>

        {/* Card Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl group perspective-1000 hover-scale"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#7c3aed] to-accent p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
                <span className="font-display font-bold tracking-wider text-lg">Otsem Pay</span>
              </div>
              <Wifi className="w-6 h-6 opacity-80 rotate-90" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-9 bg-white/20 rounded-md backdrop-blur-md border border-white/10" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-mono text-xl tracking-widest drop-shadow-md">
                    {showDetails ? "4829 1029 4829 1023" : "•••• •••• •••• 1023"}
                  </p>
                  <button onClick={() => setShowDetails(!showDetails)} className="w-10 h-10 rounded-lg hover:bg-white/20 flex items-center justify-center transition-all opacity-90 hover:opacity-100">
                    {showDetails ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
                <div className="flex justify-between items-end text-sm">
                  <div>
                    <p className="text-[10px] uppercase opacity-80 mb-0.5">Card Holder</p>
                    <p className="font-medium tracking-wide font-display">ALEX MORGAN</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase opacity-80 mb-0.5">Expires</p>
                    <p className="font-medium tracking-wide font-display">12/28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform ease-in-out" />
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16 mb-auto"
        >
          <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight">{t("cards.comingSoon")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("cards.message")}
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav active="cards" />
    </div>
  );
}
