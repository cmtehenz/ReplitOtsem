import { PageContainer } from "@/components/page-container";
import { Users, ArrowLeft, Gift, Copy, Check, Share2, UserPlus, Clock, ChevronRight, Coins, DollarSign, Wallet, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReferralCode, getReferralStats, getReferralRewards, claimReferralRewards, type ReferralReward } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export default function ReferralProgram() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: codeData, isLoading: loadingCode } = useQuery({
    queryKey: ["/api/referral/code"],
    queryFn: getReferralCode,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/referral/stats"],
    queryFn: getReferralStats,
  });

  const { data: rewardsData, isLoading: loadingRewards } = useQuery({
    queryKey: ["/api/referral/rewards"],
    queryFn: getReferralRewards,
  });

  const claimMutation = useMutation({
    mutationFn: claimReferralRewards,
    onSuccess: (data) => {
      toast.success(language === "pt-BR" 
        ? `R$ ${data.amount.toFixed(2)} adicionado à sua carteira!` 
        : `R$ ${data.amount.toFixed(2)} added to your wallet!`
      );
      queryClient.invalidateQueries({ queryKey: ["/api/referral/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCopyCode = async () => {
    if (codeData?.code) {
      await navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (codeData?.code && navigator.share) {
      try {
        await navigator.share({
          title: language === "pt-BR" ? "Junte-se ao Otsem Pay!" : "Join Otsem Pay!",
          text: language === "pt-BR" 
            ? `Use meu código de indicação ${codeData.code} para se cadastrar no Otsem Pay!`
            : `Use my referral code ${codeData.code} to sign up for Otsem Pay!`,
          url: `https://otsempay.com?ref=${codeData.code}`,
        });
      } catch (error) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleClaimRewards = () => {
    if (rewardsData?.pending && rewardsData.pending > 0) {
      claimMutation.mutate();
    }
  };

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {language === "pt-BR" ? "Programa de Indicação" : "Referral Program"}
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-primary/20 to-[#7c3aed]/30 p-6 border border-primary/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl transform translate-x-8 -translate-y-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7c3aed]/20 rounded-full blur-2xl transform -translate-x-4 translate-y-4" />
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-[#7c3aed] rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">
                    {language === "pt-BR" ? "Indique Amigos" : "Invite Friends"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt-BR" 
                      ? "Ganhe recompensas por cada indicação"
                      : "Earn rewards for every referral"
                    }
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {language === "pt-BR" 
                  ? "Compartilhe seu código exclusivo e ganhe bônus quando seus amigos se cadastrarem. Seu código é completamente anônimo - ninguém saberá quem os indicou."
                  : "Share your unique code and earn bonuses when friends sign up. Your code is completely anonymous - no one will know who referred them."
                }
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">
                {language === "pt-BR" ? "Seu Código Anônimo" : "Your Anonymous Code"}
              </span>
            </div>
            
            {loadingCode ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div 
                  className="flex-1 bg-background/50 rounded-2xl px-5 py-4 font-mono text-lg tracking-wider text-center font-bold border border-white/10"
                  data-testid="text-referral-code"
                >
                  {codeData?.code || "------"}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="w-14 h-14 rounded-2xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all border border-primary/20 hover:border-primary/40"
                  data-testid="button-copy-code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-primary" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#7c3aed] flex items-center justify-center transition-all shadow-lg hover:shadow-primary/30"
                  data-testid="button-share-code"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h3 className="font-display font-bold mb-4">
              {language === "pt-BR" ? "Suas Estatísticas" : "Your Stats"}
            </h3>
            
            {loadingStats ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-2xl bg-background/50 border border-white/5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-total-referrals">
                    {stats?.totalReferrals || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "pt-BR" ? "Total" : "Total"}
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-2xl bg-background/50 border border-white/5">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <UserPlus className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-active-referrals">
                    {stats?.activeReferrals || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "pt-BR" ? "Ativos" : "Active"}
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-2xl bg-background/50 border border-white/5">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-500" data-testid="text-pending-referrals">
                    {stats?.pendingReferrals || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "pt-BR" ? "Pendentes" : "Pending"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rewards Section */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-accent" />
                {language === "pt-BR" ? "Suas Recompensas" : "Your Rewards"}
              </h3>
            </div>
            
            {loadingRewards ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-muted-foreground">
                        {language === "pt-BR" ? "Disponível" : "Available"}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-green-400" data-testid="text-pending-rewards">
                      R$ {(rewardsData?.pending || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {language === "pt-BR" ? "Total Recebido" : "Total Earned"}
                      </span>
                    </div>
                    <p className="text-xl font-bold" data-testid="text-total-rewards">
                      R$ {(rewardsData?.paid || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {rewardsData?.pending && rewardsData.pending > 0 ? (
                  <button
                    onClick={handleClaimRewards}
                    disabled={claimMutation.isPending}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-yellow-500 text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    data-testid="button-claim-rewards"
                  >
                    {claimMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {language === "pt-BR" ? "Resgatar Recompensas" : "Claim Rewards"}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center py-3 text-sm text-muted-foreground">
                    {language === "pt-BR" 
                      ? "Indique amigos para ganhar recompensas!"
                      : "Invite friends to earn rewards!"
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h3 className="font-display font-bold mb-4">
              {language === "pt-BR" ? "Como Funciona" : "How It Works"}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">
                    {language === "pt-BR" ? "Compartilhe seu código" : "Share your code"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt-BR" 
                      ? "Envie seu código anônimo para amigos e família"
                      : "Send your anonymous code to friends and family"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">
                    {language === "pt-BR" ? "Amigos se cadastram" : "Friends sign up"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt-BR" 
                      ? "Eles inserem o código durante o cadastro"
                      : "They enter the code during registration"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">
                    {language === "pt-BR" ? "Ganhe recompensas" : "Earn rewards"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt-BR" 
                      ? "Receba bônus quando eles completarem verificação"
                      : "Get bonuses when they complete verification"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-r from-accent/10 to-accent/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-bold">
                  {language === "pt-BR" ? "Privacidade Garantida" : "Privacy Guaranteed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "pt-BR" 
                    ? "Seus indicados nunca saberão quem os indicou"
                    : "Your referrals will never know who invited them"
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="h-8" />
        </div>
      </div>
    </PageContainer>
  );
}
