import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { Users, ArrowLeft, Copy, Check, Gift, Share2, Trophy, Star, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReferralProgram() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isPortuguese = t("nav.home") === "Início";
  
  const [copied, setCopied] = useState(false);

  const referralCode = `OTSEM${user?.username?.toUpperCase().slice(0, 4) || "USER"}2024`;
  const referralLink = `https://otsempay.com/ref/${referralCode}`;

  const stats = {
    invited: 12,
    active: 8,
    earned: 240.00,
    pending: 60.00,
  };

  const rewards = [
    { level: 1, friends: 1, reward: "R$ 10", achieved: true },
    { level: 2, friends: 5, reward: "R$ 50", achieved: true },
    { level: 3, friends: 10, reward: "R$ 100", achieved: false },
    { level: 4, friends: 25, reward: "R$ 300", achieved: false },
    { level: 5, friends: 50, reward: "R$ 750", achieved: false },
  ];

  const recentReferrals = [
    { name: "Maria S.", date: "Today", status: "active", earned: "R$ 20" },
    { name: "João P.", date: "Yesterday", status: "pending", earned: "R$ 20" },
    { name: "Ana R.", date: "Dec 1", status: "active", earned: "R$ 20" },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(isPortuguese ? "Copiado!" : "Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Otsem Pay",
          text: isPortuguese 
            ? `Use meu código ${referralCode} e ganhe R$ 20 de bônus!`
            : `Use my code ${referralCode} and get R$ 20 bonus!`,
          url: referralLink,
        });
      } catch (err) {
        handleCopy(referralLink);
      }
    } else {
      handleCopy(referralLink);
    }
  };

  return (
    <PageContainer>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all border border-white/[0.06]"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {isPortuguese ? "Programa de Indicação" : "Referral Program"}
          </h1>
          <div className="w-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-3xl p-6 space-y-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-primary/20"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mx-auto border border-primary/30">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl">
              {isPortuguese ? "Ganhe R$ 20 por amigo" : "Earn R$ 20 per friend"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPortuguese 
                ? "Convide amigos e ambos ganham R$ 20 quando eles fizerem o primeiro depósito"
                : "Invite friends and you both earn R$ 20 when they make their first deposit"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.08]">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                {isPortuguese ? "Seu Código" : "Your Code"}
              </p>
              <div className="flex items-center justify-between">
                <p className="font-mono font-bold text-xl tracking-wider text-primary" data-testid="text-referral-code">
                  {referralCode}
                </p>
                <button
                  onClick={() => handleCopy(referralCode)}
                  className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all"
                  data-testid="button-copy-code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleShare}
              className="w-full h-12 rounded-2xl premium-button"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isPortuguese ? "Compartilhar Link" : "Share Link"}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.invited}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPortuguese ? "Convidados" : "Invited"}
            </p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPortuguese ? "Ativos" : "Active"}
            </p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">R$ {stats.earned.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPortuguese ? "Ganhos" : "Earned"}
            </p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">R$ {stats.pending.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPortuguese ? "Pendente" : "Pending"}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {isPortuguese ? "Níveis de Recompensa" : "Reward Levels"}
            </h3>
          </div>

          <div className="premium-card rounded-2xl p-4">
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl transition-all",
                    reward.achieved ? "bg-primary/10" : "opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border",
                    reward.achieved 
                      ? "bg-primary/20 border-primary/30 text-primary"
                      : "bg-white/[0.04] border-white/[0.08] text-muted-foreground"
                  )}>
                    {reward.level}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {reward.friends} {isPortuguese ? "amigos" : "friends"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold text-sm",
                      reward.achieved ? "text-accent" : "text-muted-foreground"
                    )}>
                      {reward.reward}
                    </span>
                    {reward.achieved && <Star className="w-4 h-4 text-accent fill-accent" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {isPortuguese ? "Indicações Recentes" : "Recent Referrals"}
            </h3>
            <button className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              {isPortuguese ? "Ver Todos" : "View All"}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentReferrals.map((referral, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="premium-card rounded-2xl p-4 flex items-center justify-between"
                data-testid={`card-referral-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold border border-primary/20">
                    {referral.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">{referral.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    referral.status === "active" ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {referral.earned}
                  </p>
                  <p className={cn(
                    "text-[10px] uppercase tracking-wider font-medium",
                    referral.status === "active" ? "text-emerald-400/70" : "text-amber-400/70"
                  )}>
                    {referral.status === "active" 
                      ? (isPortuguese ? "Ativo" : "Active")
                      : (isPortuguese ? "Pendente" : "Pending")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
