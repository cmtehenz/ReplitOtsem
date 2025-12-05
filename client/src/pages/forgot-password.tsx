import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle } from "lucide-react";
import logo from "@assets/Untitled_1764830265098.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
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
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-center">
                {t("forgotPassword.emailSent")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("forgotPassword.checkInbox")}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t("forgotPassword.sentTo")} <span className="font-medium text-foreground">{email}</span>
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={() => navigate("/auth")}
                className="w-full h-12 text-base rounded-xl"
                data-testid="button-back-to-login"
              >
                {t("forgotPassword.backToLogin")}
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              {t("forgotPassword.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("forgotPassword.description")}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-background/50"
                />
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

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl"
                disabled={loading}
                data-testid="button-submit"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t("forgotPassword.sendLink")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="w-full h-10 text-sm"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("forgotPassword.backToLogin")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
