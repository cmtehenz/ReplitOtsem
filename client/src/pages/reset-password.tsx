import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useSearch } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Loader2, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import logo from "@assets/Untitled_1764830265098.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();

  const token = new URLSearchParams(search).get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(language === "pt-BR" ? "Token inválido" : "Invalid token");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === "pt-BR" ? "As senhas não coincidem" : "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(language === "pt-BR" ? "A senha deve ter pelo menos 6 caracteres" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-otsem-gradient text-foreground flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-accent/5 to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
          <div className="pt-8 pb-6 text-center flex flex-col items-center">
            <img src={logo} alt="Otsem Pay" className="w-28 h-auto mb-4 drop-shadow-lg" />
          </div>

          <Card className="w-full max-w-md border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-center">
                {language === "pt-BR" ? "Link Inválido" : "Invalid Link"}
              </CardTitle>
              <CardDescription className="text-center">
                {language === "pt-BR" 
                  ? "O link de redefinição de senha é inválido ou expirou."
                  : "The password reset link is invalid or has expired."
                }
              </CardDescription>
            </CardHeader>
            
            <CardFooter>
              <Button
                onClick={() => navigate("/forgot-password")}
                className="w-full h-12 text-base rounded-xl"
                data-testid="button-request-new"
              >
                {language === "pt-BR" ? "Solicitar Novo Link" : "Request New Link"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-otsem-gradient text-foreground flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-accent/5 to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
          <div className="pt-8 pb-6 text-center flex flex-col items-center">
            <img src={logo} alt="Otsem Pay" className="w-28 h-auto mb-4 drop-shadow-lg" />
          </div>

          <Card className="w-full max-w-md border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <CardTitle className="text-2xl text-center">
                {language === "pt-BR" ? "Senha Atualizada!" : "Password Updated!"}
              </CardTitle>
              <CardDescription className="text-center">
                {language === "pt-BR" 
                  ? "Sua senha foi redefinida com sucesso."
                  : "Your password has been reset successfully."
                }
              </CardDescription>
            </CardHeader>
            
            <CardFooter>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-primary to-[#7c3aed]"
                data-testid="button-login"
              >
                {language === "pt-BR" ? "Fazer Login" : "Sign In"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-accent/5 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="pt-8 pb-6 text-center flex flex-col items-center">
          <img src={logo} alt="Otsem Pay" className="w-28 h-auto mb-4 drop-shadow-lg" />
        </div>

        <Card className="w-full max-w-md border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              {language === "pt-BR" ? "Nova Senha" : "New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {language === "pt-BR" 
                ? "Digite sua nova senha abaixo"
                : "Enter your new password below"
              }
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === "pt-BR" ? "Nova Senha" : "New Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-testid="input-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {language === "pt-BR" ? "Confirmar Senha" : "Confirm Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    data-testid="input-confirm-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-xl"
                  data-testid="text-error"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-primary to-[#7c3aed]"
                disabled={loading}
                data-testid="button-submit"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {language === "pt-BR" ? "Redefinir Senha" : "Reset Password"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
