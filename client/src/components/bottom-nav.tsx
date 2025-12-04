import { Home, Wallet, ArrowLeftRight, Clock, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const navItems = [
  { id: "home", icon: Home, path: "/" },
  { id: "wallet", icon: Wallet, path: "/wallet" },
  { id: "exchange", icon: ArrowLeftRight, path: null },
  { id: "activity", icon: Clock, path: "/activity" },
  { id: "cards", icon: CreditCard, path: "/cards" },
];

export function BottomNav({ active }: { active: string }) {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  const getLabel = (id: string) => {
    const labels: Record<string, string> = {
      home: isPortuguese ? "Início" : "Home",
      wallet: isPortuguese ? "Carteira" : "Wallet",
      exchange: isPortuguese ? "Trocar" : "Exchange",
      activity: isPortuguese ? "Atividade" : "Activity",
      cards: isPortuguese ? "Cartões" : "Cards",
    };
    return labels[id] || id;
  };

  const handleExchangeClick = () => {
    const exchangeSection = document.getElementById("exchange-section");
    if (exchangeSection) {
      exchangeSection.scrollIntoView({ behavior: "smooth" });
    } else {
      setLocation("/");
      setTimeout(() => {
        document.getElementById("exchange-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          if (item.id === "exchange") {
            return (
              <button
                key={item.id}
                onClick={handleExchangeClick}
                className="flex flex-col items-center justify-center -mt-4"
                data-testid="button-exchange-nav"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => item.path && setLocation(item.path)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]"
              data-testid={`nav-${item.id}`}
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                {getLabel(item.id)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
