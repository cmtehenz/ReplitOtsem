import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, ArrowRight, Loader2, Mail } from "lucide-react";
import { redirectToSocialLogin } from "@/lib/api";
import logoImage from "@assets/Untitled_1764875614521.png";

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <img 
              src={logoImage} 
              alt="Otsem Pay" 
              className="w-20 h-20 mx-auto object-contain"
              data-testid="img-logo"
            />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">Otsem Pay</h1>
              <p className="text-gray-500">
                {isLogin ? t("auth.loginDescription") : t("auth.registerDescription")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 card-shadow space-y-6">
            {!showEmailForm ? (
              <div className="space-y-4">
                <Button
                  type="button"
                  className="w-full h-12 font-medium rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm"
                  onClick={handleSocialLogin}
                  data-testid="button-google-login"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t("auth.continueWithGoogle")}
                </Button>
                
                <Button
                  type="button"
                  className="w-full h-12 font-medium rounded-xl bg-black hover:bg-gray-900 text-white"
                  onClick={handleSocialLogin}
                  data-testid="button-apple-login"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  {t("auth.continueWithApple")}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-500">{t("auth.or")}</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  className="w-full h-12 font-medium rounded-xl bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setShowEmailForm(true)}
                  data-testid="button-email-login"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  {t("auth.continueWithEmail")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  onClick={() => {
                    setShowEmailForm(false);
                    setError("");
                  }}
                  data-testid="button-back-to-social"
                >
                  ← {t("auth.backToOptions")}
                </button>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">{t("auth.name")}</Label>
                    <Input
                      id="name"
                      data-testid="input-name"
                      placeholder={t("auth.namePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    {isLogin ? t("auth.usernameOrEmail") : t("auth.username")}
                  </Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    placeholder={isLogin ? t("auth.usernameOrEmailPlaceholder") : t("auth.usernamePlaceholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!isLogin}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      data-testid="input-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12 rounded-xl border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                      CPF <span className="text-gray-400 text-xs">({t("auth.optional")})</span>
                    </Label>
                    <Input
                      id="cpf"
                      data-testid="input-cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      maxLength={14}
                      className="h-12 rounded-xl border-gray-200"
                    />
                    <p className="text-xs text-gray-500">{t("auth.cpfHelp")}</p>
                  </div>
                )}

                {error && (
                  <p
                    className="text-sm text-red-600 text-center p-3 bg-red-50 rounded-xl"
                    data-testid="text-error"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
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

                <div className="text-center text-sm text-gray-500">
                  {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-primary hover:text-primary/80 font-semibold"
                    data-testid="button-toggle-auth"
                  >
                    {isLogin ? t("auth.register") : t("auth.login")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
