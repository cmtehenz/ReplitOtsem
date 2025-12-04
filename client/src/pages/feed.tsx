import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Activity, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: number;
  titleEn: string;
  titlePt: string;
  descriptionEn: string;
  descriptionPt: string;
  category: "breaking" | "market" | "general";
  timestamp: string;
  trend: number;
  source: string;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    titleEn: "Bitcoin Surges to New Monthly High",
    titlePt: "Bitcoin Atinge Nova Máxima Mensal",
    descriptionEn: "Bitcoin breaks through $45,000 barrier amid renewed institutional interest and positive macroeconomic outlook.",
    descriptionPt: "Bitcoin ultrapassa a barreira de $45.000 em meio a renovado interesse institucional e perspectiva macroeconômica positiva.",
    category: "breaking",
    timestamp: "2 hours ago",
    trend: 12.5,
    source: "CryptoSlate",
  },
  {
    id: 2,
    titleEn: "Ethereum Layer-2 Solutions See Record Adoption",
    titlePt: "Soluções Ethereum Layer-2 Registram Adoção Recorde",
    descriptionEn: "Arbitrum and Optimism TVL reaches $5B as developers migrate from Layer-1 due to lower fees.",
    descriptionPt: "TVL de Arbitrum e Optimism atinge $5B enquanto desenvolvedores migram da Layer-1 devido a taxas mais baixas.",
    category: "market",
    timestamp: "4 hours ago",
    trend: 8.3,
    source: "Cointelegraph",
  },
  {
    id: 3,
    titleEn: "XRP Rallies on Favorable Regulatory News",
    titlePt: "XRP Sobe com Notícias Regulatórias Favoráveis",
    descriptionEn: "Ripple's native token gains 15% following positive developments in SEC settlement discussions.",
    descriptionPt: "Token nativo do Ripple ganha 15% após desenvolvimentos positivos em discussões de acordo com a SEC.",
    category: "breaking",
    timestamp: "6 hours ago",
    trend: 15.2,
    source: "CryptoSlate",
  },
  {
    id: 4,
    titleEn: "DeFi Protocols Generate Record Revenue",
    titlePt: "Protocolos DeFi Geram Receita Recorde",
    descriptionEn: "Top DeFi platforms report $2.3M in weekly revenue as trading volume increases 40% YoY.",
    descriptionPt: "Principais plataformas DeFi relatam $2,3M em receita semanal conforme volume de negociação aumenta 40% YoY.",
    category: "market",
    timestamp: "8 hours ago",
    trend: 7.1,
    source: "Cointelegraph",
  },
  {
    id: 5,
    titleEn: "Solana Network Reaches 600K Daily Active Users",
    titlePt: "Rede Solana Atinge 600K Usuários Ativos Diários",
    descriptionEn: "Solana ecosystem demonstrates strong growth momentum with increased validator participation and network stability.",
    descriptionPt: "Ecossistema Solana demonstra forte impulso de crescimento com aumento na participação de validadores e estabilidade de rede.",
    category: "general",
    timestamp: "10 hours ago",
    trend: 5.8,
    source: "CryptoSlate",
  },
  {
    id: 6,
    titleEn: "Staking Rewards Hit Record High",
    titlePt: "Recompensas de Staking Atingem Máxima Recorde",
    descriptionEn: "Average staking APY across major networks reaches 12.5% as more users participate in proof-of-stake.",
    descriptionPt: "APY médio de staking em redes principais atinge 12,5% conforme mais usuários participam de prova de participação.",
    category: "market",
    timestamp: "12 hours ago",
    trend: 9.4,
    source: "Cointelegraph",
  },
];

export default function Feed() {
  const { language, t } = useLanguage();

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

  const getTitle = (item: NewsItem) => {
    return language === "pt-BR" ? item.titlePt : item.titleEn;
  };

  const getDescription = (item: NewsItem) => {
    return language === "pt-BR" ? item.descriptionPt : item.descriptionEn;
  };

  const getCategoryLabel = (category: string) => {
    if (category === "breaking") return language === "pt-BR" ? "Destaque" : "Breaking";
    if (category === "market") return language === "pt-BR" ? "Mercado" : "Market";
    return language === "pt-BR" ? "Geral" : "General";
  };

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground pb-32">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">{t("feed.title")}</h1>
          <p className="text-sm text-muted-foreground font-medium">{t("feed.latest")}</p>
        </div>

        {/* News Feed */}
        <div className="space-y-4">
          {newsData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-3xl p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("p-2 rounded-lg border flex items-center justify-center", getCategoryColor(item.category))}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", getCategoryColor(item.category))}>
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{item.timestamp}</span>
                    </div>
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                      {getTitle(item)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{item.trend.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {getDescription(item)}
                </p>

                {/* Footer */}
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
      </div>

      <BottomNav active="feed" />
    </div>
  );
}
