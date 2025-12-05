import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, ArrowLeft, Gift, Check } from "lucide-react";
import { validateReferralCode } from "@/lib/api";
import logo from "@assets/Untitled_1764830265098.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register, twoFactorChallenge, completeTwoFactorLogin, cancelTwoFactorLogin } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    if (referralCode.length >= 6 && !isLogin) {
      const timer = setTimeout(async () => {
        setValidatingReferral(true);
        try {
          const result = await validateReferralCode(referralCode);
          setReferralValid(result.valid);
        } catch {
          setReferralValid(null);
        } finally {
          setValidatingReferral(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setReferralValid(null);
    }
  }, [referralCode, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(username, password);
        if (!result.requiresTwoFactor) {
          navigate("/");
        }
      } else {
        await register({ 
          username, 
          email, 
          password, 
          name, 
          cpf: cpf || undefined,
          referralCode: referralCode || undefined
        });
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await completeTwoFactorLogin(twoFactorCode);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTwoFactor = () => {
    cancelTwoFactorLogin();
    setTwoFactorCode("");
    setError("");
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value.slice(0, 14);
  };

  if (twoFactorChallenge) {
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
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">
                {t("auth.twoFactorTitle") || "Two-Factor Authentication"}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.twoFactorDescription") || "Enter the 6-digit code from your authenticator app"}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleTwoFactorSubmit}>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={twoFactorCode[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val) {
                          const newCode = twoFactorCode.slice(0, i) + val + twoFactorCode.slice(i + 1);
                          setTwoFactorCode(newCode.slice(0, 6));
                          if (i < 5) {
                            const next = e.target.nextElementSibling as HTMLInputElement;
                            next?.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !twoFactorCode[i] && i > 0) {
                          const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                          prev?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center text-xl font-bold bg-background/50 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      data-testid={`input-2fa-code-${i}`}
                    />
                  ))}
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

                <p className="text-xs text-muted-foreground text-center">
                  {t("auth.twoFactorBackupHint") || "You can also use a backup code"}
                </p>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base rounded-xl"
                  disabled={loading || twoFactorCode.length !== 6}
                  data-testid="button-verify-2fa"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t("auth.verify") || "Verify"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelTwoFactor}
                  className="w-full h-10 text-sm"
                  data-testid="button-cancel-2fa"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("auth.backToLogin") || "Back to login"}
                </Button>
              </CardFooter>
            </form>
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
            <CardTitle className="text-2xl text-center">
              {isLogin ? t("auth.login") : t("auth.register")}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? t("auth.loginDescription")
                : t("auth.registerDescription")
              }
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name">{t("auth.name")}</Label>
                    <Input
                      id="name"
                      data-testid="input-name"
                      placeholder={t("auth.namePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="h-12 bg-background/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="username">
                  {isLogin ? t("auth.usernameOrEmail") : t("auth.username")}
                </Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder={isLogin ? t("auth.usernameOrEmailPlaceholder") : t("auth.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 bg-background/50"
                />
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!isLogin}
                      className="h-12 bg-background/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs text-primary hover:underline font-medium"
                      data-testid="button-forgot-password"
                    >
                      {language === "pt-BR" ? "Esqueceu a senha?" : "Forgot password?"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-testid="input-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10 bg-background/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="cpf"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="cpf">
                      CPF <span className="text-muted-foreground text-sm">({t("auth.optional")})</span>
                    </Label>
                    <Input
                      id="cpf"
                      data-testid="input-cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      maxLength={14}
                      className="h-12 bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("auth.cpfHelp")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="referral"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="referralCode">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        {language === "pt-BR" ? "Código de Indicação" : "Referral Code"}
                        <span className="text-muted-foreground text-sm">({t("auth.optional")})</span>
                      </div>
                    </Label>
                    <div className="relative">
                      <Input
                        id="referralCode"
                        data-testid="input-referral-code"
                        placeholder="OTSEM-XXXXXX"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        maxLength={12}
                        className="h-12 bg-background/50 font-mono tracking-wider uppercase"
                      />
                      {validatingReferral && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!validatingReferral && referralValid === true && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {referralValid === true && (
                      <p className="text-xs text-green-500">
                        {language === "pt-BR" ? "Código válido!" : "Valid code!"}
                      </p>
                    )}
                    {referralValid === false && referralCode.length >= 6 && (
                      <p className="text-xs text-yellow-500">
                        {language === "pt-BR" ? "Código não encontrado (você ainda pode se cadastrar)" : "Code not found (you can still sign up)"}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

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
                    {isLogin ? t("auth.login") : t("auth.register")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-toggle-auth"
                >
                  {isLogin ? t("auth.register") : t("auth.login")}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
