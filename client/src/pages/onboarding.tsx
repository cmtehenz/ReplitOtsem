import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { completeOnboarding } from "@/lib/api";
import { 
  Wallet, 
  ArrowRight, 
  QrCode, 
  ArrowLeftRight, 
  Shield, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import logo from "@assets/Untitled_1764830265098.png";

interface OnboardingScreen {
  titleKey: string;
  subtitleKey: string;
  icon: React.ReactNode;
  gradient: string;
}

const screens: OnboardingScreen[] = [
  {
    titleKey: "onboarding.screen1Title",
    subtitleKey: "onboarding.screen1Subtitle",
    icon: <Wallet className="w-16 h-16" />,
    gradient: "from-primary/30 via-primary/20 to-transparent",
  },
  {
    titleKey: "onboarding.screen2Title",
    subtitleKey: "onboarding.screen2Subtitle",
    icon: <QrCode className="w-16 h-16" />,
    gradient: "from-accent/30 via-accent/20 to-transparent",
  },
  {
    titleKey: "onboarding.screen3Title",
    subtitleKey: "onboarding.screen3Subtitle",
    icon: <ArrowLeftRight className="w-16 h-16" />,
    gradient: "from-emerald-500/30 via-emerald-500/20 to-transparent",
  },
  {
    titleKey: "onboarding.screen4Title",
    subtitleKey: "onboarding.screen4Subtitle",
    icon: <Shield className="w-16 h-16" />,
    gradient: "from-primary/30 via-accent/20 to-transparent",
  },
];

export default function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const [, navigate] = useLocation();

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      await refreshUser();
      navigate("/");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      navigate("/");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const isLastScreen = currentScreen === screens.length - 1;
  const screen = screens[currentScreen];

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div 
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${screen.gradient}`} 
        />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-accent/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      </div>

      <div className="relative z-10 p-6 flex justify-between items-center">
        <motion.img 
          src={logo} 
          alt="Otsem Pay" 
          className="w-12 h-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        {!isLastScreen && (
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
            data-testid="button-skip"
          >
            {t("onboarding.skip")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-center max-w-md"
          >
            <motion.div 
              className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-white/10 flex items-center justify-center"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            >
              <div className="text-primary">
                {screen.icon}
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
              </motion.div>
            </motion.div>

            <motion.h1 
              className="text-3xl font-display font-bold mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t(screen.titleKey)}
            </motion.h1>

            <motion.p 
              className="text-muted-foreground text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t(screen.subtitleKey)}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 p-8">
        <div className="flex justify-center gap-2 mb-8">
          {screens.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentScreen 
                  ? "w-8 bg-primary" 
                  : index < currentScreen 
                    ? "w-2 bg-primary/50" 
                    : "w-2 bg-white/20"
              }`}
              animate={{ 
                scale: index === currentScreen ? 1.1 : 1,
              }}
              onClick={() => setCurrentScreen(index)}
              style={{ cursor: "pointer" }}
              data-testid={`indicator-${index}`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={isLastScreen ? handleComplete : handleNext}
            disabled={isCompleting}
            className="w-full h-16 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[0_0_30px_rgba(139,92,246,0.4)] font-bold transition-all hover:scale-[1.02]"
            data-testid={isLastScreen ? "button-get-started" : "button-next"}
          >
            {isCompleting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                {isLastScreen ? t("onboarding.getStarted") : t("onboarding.next")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
