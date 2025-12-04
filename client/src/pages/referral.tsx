import { useState } from "react";
import { Users, ArrowLeft, Copy, Check, Gift, Share2, Trophy, Star, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getReferrals, type ReferralData } from "@/lib/api";

export default function ReferralProgram() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isPortuguese = t("nav.home") === "Início";
  
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery({
    queryKey: ["referrals"],
    queryFn: getReferrals,
  });

  const referralCode = referralData?.code || `OTSEM${user?.username?.toUpperCase().slice(0, 4) || "USER"}0000`;
  const referralLink = `https://otsempay.com/ref/${referralCode}`;

  const stats = referralData?.stats || {
    invited: 0,
    active: 0,
    earned: 0,
    pending: 0,
  };

  const rewards = [
    { level: 1, friends: 1, reward: "R$ 10", achieved: stats.active >= 1 },
    { level: 2, friends: 5, reward: "R$ 50", achieved: stats.active >= 5 },
    { level: 3, friends: 10, reward: "R$ 100", achieved: stats.active >= 10 },
    { level: 4, friends: 25, reward: "R$ 300", achieved: stats.active >= 25 },
    { level: 5, friends: 50, reward: "R$ 750", achieved: stats.active >= 50 },
  ];

  const recentReferrals = referralData?.recentReferrals || [];

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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return isPortuguese ? "Hoje" : "Today";
    if (diffDays === 1) return isPortuguese ? "Ontem" : "Yesterday";
    return date.toLocaleDateString(isPortuguese ? "pt-BR" : "en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isPortuguese ? "Programa de Indicação" : "Referral Program"}
          </h1>
          <div className="w-10" />
        </div>

        <div className="bg-gradient-to-br from-primary/10 via-white to-accent/10 rounded-2xl p-5 card-shadow border border-primary/10">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Gift className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-bold text-xl text-gray-900">
              {isPortuguese ? "Ganhe R$ 20 por amigo" : "Earn R$ 20 per friend"}
            </h2>
            <p className="text-sm text-gray-500">
              {isPortuguese 
                ? "Convide amigos e ambos ganham R$ 20 quando eles fizerem o primeiro depósito"
                : "Invite friends and you both earn R$ 20 when they make their first deposit"}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                {isPortuguese ? "Seu Código" : "Your Code"}
              </p>
              <div className="flex items-center justify-between">
                <p className="font-mono font-bold text-xl tracking-wider text-primary" data-testid="text-referral-code">
                  {referralCode}
                </p>
                <button
                  onClick={() => handleCopy(referralCode)}
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  data-testid="button-copy-code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleShare}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isPortuguese ? "Compartilhar Link" : "Share Link"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-primary">{stats.invited}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isPortuguese ? "Convidados" : "Invited"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isPortuguese ? "Ativos" : "Active"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-accent">R$ {stats.earned.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isPortuguese ? "Ganhos" : "Earned"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-amber-500">R$ {stats.pending.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isPortuguese ? "Pendente" : "Pending"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Trophy className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {isPortuguese ? "Níveis de Recompensa" : "Reward Levels"}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="space-y-2">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    reward.achieved ? "bg-primary/5" : "opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                    reward.achieved 
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-400"
                  )}>
                    {reward.level}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reward.friends} {isPortuguese ? "amigos" : "friends"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold text-sm",
                      reward.achieved ? "text-accent" : "text-gray-400"
                    )}>
                      {reward.reward}
                    </span>
                    {reward.achieved && <Star className="w-4 h-4 text-accent fill-accent" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
            {isPortuguese ? "Indicações Recentes" : "Recent Referrals"}
          </h3>

          {recentReferrals.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 card-shadow text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                {isPortuguese 
                  ? "Nenhuma indicação ainda. Compartilhe seu código!"
                  : "No referrals yet. Share your code!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReferrals.map((referral, index) => (
                <div
                  key={referral.id}
                  className="bg-white rounded-2xl p-4 card-shadow flex items-center justify-between"
                  data-testid={`card-referral-${referral.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-sm font-bold text-primary">
                      {referral.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{referral.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(referral.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      referral.status === "active" ? "text-emerald-600" : "text-amber-500"
                    )}>
                      {referral.earned ? `R$ ${parseFloat(referral.earned).toFixed(0)}` : "R$ 20"}
                    </p>
                    <p className={cn(
                      "text-[10px] uppercase tracking-wider font-medium",
                      referral.status === "active" ? "text-emerald-500" : "text-amber-400"
                    )}>
                      {referral.status === "active" 
                        ? (isPortuguese ? "Ativo" : "Active")
                        : (isPortuguese ? "Pendente" : "Pending")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
