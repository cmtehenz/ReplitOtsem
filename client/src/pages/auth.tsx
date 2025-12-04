import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, ArrowRight, Loader2, Mail } from "lucide-react";
import { redirectToSocialLogin } from "@/lib/api";
import logo from "@assets/Untitled_1764846041499.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register({ username, email, password, name, cpf: cpf || undefined });
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    redirectToSocialLogin();
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

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="pt-4 pb-12 text-center flex flex-col items-center">
          <motion.img 
            src={logo} 
            alt="Otsem Pay" 
            className="w-52 h-auto drop-shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        <Card className="w-full max-w-md border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.4)] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl rounded-3xl">
          <CardHeader className="space-y-1 pb-2">
            {showEmailForm && (
              <>
                <CardTitle className="text-2xl text-center font-display font-semibold">
                  {isLogin ? t("auth.login") : t("auth.register")}
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground/70">
                  {isLogin ? t("auth.loginDescription") : t("auth.registerDescription")}
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div
                key="social-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-3 px-6 pb-6">
                  <Button
                    type="button"
                    className="w-full h-14 text-base font-semibold rounded-2xl bg-white hover:bg-gray-50 text-gray-800 border-0 shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3"
                    onClick={handleSocialLogin}
                    data-testid="button-google-login"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t("auth.continueWithGoogle")}
                  </Button>
                  
                  <Button
                    type="button"
                    className="w-full h-14 text-base font-semibold rounded-2xl bg-black hover:bg-gray-900 text-white border-0 shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3"
                    onClick={handleSocialLogin}
                    data-testid="button-apple-login"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    {t("auth.continueWithApple")}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/80 backdrop-blur-sm px-4 text-muted-foreground/60 font-medium tracking-wider">{t("auth.or")}</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    className="w-full h-14 text-base font-semibold rounded-2xl premium-button flex items-center justify-center gap-3"
                    onClick={() => setShowEmailForm(true)}
                    data-testid="button-email-login"
                  >
                    <Mail className="w-5 h-5" />
                    {t("auth.continueWithEmail")}
                  </Button>
                </CardContent>
              </motion.div>
            ) : (
              <motion.form 
                key="email-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-4 px-6">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-muted-foreground hover:text-foreground -ml-2 font-medium"
                    onClick={() => {
                      setShowEmailForm(false);
                      setError("");
                    }}
                    data-testid="button-back-to-social"
                  >
                    ← {t("auth.backToOptions")}
                  </Button>

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
                        <Label htmlFor="name" className="text-sm font-medium">{t("auth.name")}</Label>
                        <Input
                          id="name"
                          data-testid="input-name"
                          placeholder={t("auth.namePlaceholder")}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                          className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      {isLogin ? t("auth.usernameOrEmail") : t("auth.username")}
                    </Label>
                    <Input
                      id="username"
                      data-testid="input-username"
                      placeholder={isLogin ? t("auth.usernameOrEmailPlaceholder") : t("auth.usernamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
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
                        <Label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          data-testid="input-email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required={!isLogin}
                          className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        data-testid="input-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-12 bg-white/[0.04] border-white/[0.08] rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
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
                        <Label htmlFor="cpf" className="text-sm font-medium">
                          CPF <span className="text-muted-foreground/60 text-xs">({t("auth.optional")})</span>
                        </Label>
                        <Input
                          id="cpf"
                          data-testid="input-cpf"
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={(e) => setCpf(formatCPF(e.target.value))}
                          maxLength={14}
                          className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground/60">
                          {t("auth.cpfHelp")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-xl border border-destructive/20"
                      data-testid="text-error"
                    >
                      {error}
                    </motion.p>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4 px-6 pb-6">
                  <Button
                    type="submit"
                    className="w-full h-13 text-base rounded-2xl premium-button"
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

                  <div className="text-center text-sm text-muted-foreground/70">
                    {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                      }}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                      data-testid="button-toggle-auth"
                    >
                      {isLogin ? t("auth.register") : t("auth.login")}
                    </button>
                  </div>
                </CardFooter>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
