import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Newspaper, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Feed() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">{t("feed.title")}</h1>
          <p className="text-sm text-muted-foreground font-medium">{t("feed.latest")}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-20 space-y-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
              <Newspaper className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>

          <div className="space-y-3 max-w-xs">
            <h2 className="text-2xl font-display font-bold tracking-tight">
              {t("feed.title") === "Feed" ? "Coming Soon" : "Em Breve"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("feed.title") === "Feed" 
                ? "Stay tuned for the latest crypto news and market updates." 
                : "Fique atento às últimas notícias de cripto e atualizações do mercado."}
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav active="feed" />
    </div>
  );
}
