import { BottomNav } from "@/components/bottom-nav";
import { BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Stats() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="font-display font-bold text-2xl tracking-tight">
          {isPortuguese ? "Estatísticas" : "Statistics"}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-20 space-y-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
              <BarChart3 className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>

          <div className="space-y-3 max-w-xs">
            <h2 className="text-2xl font-display font-bold tracking-tight">
              {isPortuguese ? "Em Breve" : "Coming Soon"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isPortuguese 
                ? "Acompanhe suas estatísticas de gastos e receitas em breve." 
                : "Track your spending and income statistics soon."}
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav active="stats" />
    </div>
  );
}
