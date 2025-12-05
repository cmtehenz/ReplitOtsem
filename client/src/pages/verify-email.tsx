import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { requestEmailVerification, verifyEmail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type Step = "request" | "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("request");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      handleVerify(tokenParam);
    }
  }, [search]);

  const handleVerify = async (verificationToken: string) => {
    setStep("verifying");
    setLoading(true);
    try {
      await verifyEmail(verificationToken);
      setStep("success");
      await refreshUser();
      toast.success(language === "pt-BR" ? "Email verificado com sucesso!" : "Email verified successfully!");
    } catch (error: any) {
      setStep("error");
      setErrorMessage(error.message || (language === "pt-BR" ? "Falha na verificação" : "Verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    setLoading(true);
    try {
      const response = await requestEmailVerification();
      toast.success(language === "pt-BR" ? "Email de verificação enviado!" : "Verification email sent!");
      if (response.token) {
        setToken(response.token);
      }
    } catch (error: any) {
      toast.error(error.message || (language === "pt-BR" ? "Falha ao enviar email" : "Failed to send email"));
    } finally {
      setLoading(false);
    }
  };

  if (user?.verified) {
    return (
      <PageContainer>
        <div className="p-6 flex flex-col h-full min-h-[80vh]">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setLocation("/profile")}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg">
              {language === "pt-BR" ? "Verificação de Email" : "Email Verification"}
            </h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">
              {language === "pt-BR" ? "Email Verificado" : "Email Verified"}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {language === "pt-BR" 
                ? "Seu email já está verificado."
                : "Your email is already verified."
              }
            </p>
            <Button onClick={() => setLocation("/profile")} className="rounded-2xl px-8">
              {language === "pt-BR" ? "Voltar ao Perfil" : "Back to Profile"}
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full min-h-[80vh]">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg">
            {language === "pt-BR" ? "Verificação de Email" : "Email Verification"}
          </h1>
          <div className="w-10" />
        </div>

        {step === "request" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === "pt-BR" ? "Verifique seu Email" : "Verify your Email"}
            </h2>
            <p className="text-muted-foreground text-center mb-2">
              {user?.email}
            </p>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">
              {language === "pt-BR" 
                ? "Enviaremos um link de verificação para seu email."
                : "We'll send a verification link to your email."
              }
            </p>

            <Button 
              onClick={handleRequestVerification}
              disabled={loading}
              className="rounded-2xl px-8 h-14 w-full max-w-xs bg-gradient-to-r from-primary to-[#7c3aed] font-bold"
              data-testid="button-send-verification"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                language === "pt-BR" ? "Enviar Verificação" : "Send Verification"
              )}
            </Button>

            {token && (
              <div className="mt-8 p-4 glass-card rounded-2xl border border-white/10 max-w-xs w-full">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === "pt-BR" ? "Token de verificação (para testes):" : "Verification token (for testing):"}
                </p>
                <p className="text-xs font-mono break-all text-primary">{token}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 rounded-xl"
                  onClick={() => handleVerify(token)}
                >
                  {language === "pt-BR" ? "Verificar Agora" : "Verify Now"}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === "verifying" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
            <h2 className="text-xl font-bold mb-2">
              {language === "pt-BR" ? "Verificando..." : "Verifying..."}
            </h2>
            <p className="text-muted-foreground text-center">
              {language === "pt-BR" 
                ? "Aguarde enquanto verificamos seu email."
                : "Please wait while we verify your email."
              }
            </p>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 text-green-500">
              {language === "pt-BR" ? "Verificado!" : "Verified!"}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {language === "pt-BR" 
                ? "Seu email foi verificado com sucesso."
                : "Your email has been successfully verified."
              }
            </p>
            <Button 
              onClick={() => setLocation("/profile")} 
              className="rounded-2xl px-8 h-14 bg-gradient-to-r from-primary to-[#7c3aed] font-bold"
              data-testid="button-back-profile"
            >
              {language === "pt-BR" ? "Voltar ao Perfil" : "Back to Profile"}
            </Button>
          </motion.div>
        )}

        {step === "error" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-500">
              {language === "pt-BR" ? "Erro na Verificação" : "Verification Error"}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {errorMessage}
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep("request")} 
                className="rounded-2xl px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === "pt-BR" ? "Tentar Novamente" : "Try Again"}
              </Button>
              <Button 
                onClick={() => setLocation("/profile")} 
                className="rounded-2xl px-6"
              >
                {language === "pt-BR" ? "Voltar" : "Go Back"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
