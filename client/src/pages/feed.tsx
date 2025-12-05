import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Activity, ExternalLink, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getCryptoNews, type CryptoNews } from "@/lib/api";

export default function Feed() {
  const { language, t } = useLanguage();
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const lang = language === "pt-BR" ? "pt" : "en";
        const data = await getCryptoNews(lang);
        setNews(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [language]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "breaking":
        return <Flame className="w-5 h-5" />;
      case "market":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breaking":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "market":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getCategoryLabel = (category: string) => {
    if (category === "breaking") return language === "pt-BR" ? "Destaque" : "Breaking";
    if (category === "market") return language === "pt-BR" ? "Mercado" : "Market";
    return language === "pt-BR" ? "Geral" : "General";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return language === "pt-BR" ? `${diffMins} min atrás` : `${diffMins} min ago`;
    }
    if (diffHours < 24) {
      return language === "pt-BR" ? `${diffHours}h atrás` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return language === "pt-BR" ? `${diffDays}d atrás` : `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">{t("feed.title")}</h1>
          <p className="text-sm text-muted-foreground font-medium">{t("feed.latest")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-3xl p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
                data-testid={`news-item-${item.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-2 rounded-lg border flex items-center justify-center", getCategoryColor(item.category))}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", getCategoryColor(item.category))}>
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">{formatTimestamp(item.timestamp)}</span>
                      </div>
                      <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    {item.trend > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{item.trend.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-muted-foreground font-medium">{item.source}</span>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2 transition-all group/btn">
                      {t("feed.readMore")}
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="feed" />
    </div>
  );
}
