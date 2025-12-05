import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Lock, Smartphone, Key, History, ChevronRight, ShieldCheck, LogOut, Eye, EyeOff, Copy, Check, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { get2FAStatus, setup2FA, verify2FA, disable2FA, changePassword, logoutAllSessions, logout } from "@/lib/api";

type SecurityView = "main" | "change-password" | "setup-2fa" | "disable-2fa" | "login-history";

const translations: Record<"en" | "pt-BR", Record<string, string>> = {
  en: {
    securityCenter: "Security Center",
    highSecurity: "High Security",
    highSecurityDesc: "Your account is fully protected with 2FA enabled.",
    mediumSecurity: "Medium Security",
    mediumSecurityDesc: "Enable 2FA to increase your account protection.",
    authentication: "Authentication",
    twoFactorAuth: "Two-Factor Auth",
    googleAuth: "Google Authenticator",
    biometricLogin: "Biometric Login",
    faceTouch: "FaceID / TouchID",
    changePassword: "Change Password",
    lastChanged: "Last changed 3 months ago",
    activity: "Activity",
    loginHistory: "Login History",
    viewDevices: "View recent devices and locations",
    signOutAll: "Sign Out of All Devices",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordRequirements: "Password must be at least 8 characters with 1 number",
    updatePassword: "Update Password",
    passwordUpdated: "Password Updated!",
    passwordUpdatedDesc: "Your password has been successfully changed.",
    setup2FA: "Set Up 2FA",
    scan2FAQr: "Scan QR Code",
    scan2FADesc: "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)",
    manualEntry: "Manual Entry",
    secretKey: "Secret Key",
    enterCode: "Enter Verification Code",
    enter6Digit: "Enter the 6-digit code from your app",
    verify: "Verify & Enable",
    twoFAEnabled: "2FA Enabled!",
    twoFAEnabledDesc: "Your account is now protected with two-factor authentication.",
    backupCodes: "Backup Codes",
    backupCodesDesc: "Save these codes in a safe place. You can use them to access your account if you lose your phone.",
    done: "Done",
    copied: "Copied!",
    back: "Back",
    device: "Device",
    location: "Location",
    time: "Time",
    current: "Current",
    disable2FA: "Disable 2FA",
    disable2FADesc: "Enter your password to disable two-factor authentication.",
    disableConfirm: "Disable 2FA",
    password: "Password",
    wrongPassword: "Incorrect password",
    incorrectCode: "Incorrect verification code",
    loading: "Loading...",
  },
  "pt-BR": {
    securityCenter: "Central de Segurança",
    highSecurity: "Alta Segurança",
    highSecurityDesc: "Sua conta está totalmente protegida com 2FA ativado.",
    mediumSecurity: "Segurança Média",
    mediumSecurityDesc: "Ative o 2FA para aumentar a proteção da sua conta.",
    authentication: "Autenticação",
    twoFactorAuth: "Autenticação 2FA",
    googleAuth: "Google Authenticator",
    biometricLogin: "Login Biométrico",
    faceTouch: "FaceID / TouchID",
    changePassword: "Alterar Senha",
    lastChanged: "Alterada há 3 meses",
    activity: "Atividade",
    loginHistory: "Histórico de Login",
    viewDevices: "Ver dispositivos e locais recentes",
    signOutAll: "Sair de Todos os Dispositivos",
    currentPassword: "Senha Atual",
    newPassword: "Nova Senha",
    confirmPassword: "Confirmar Nova Senha",
    passwordRequirements: "A senha deve ter pelo menos 8 caracteres com 1 número",
    updatePassword: "Atualizar Senha",
    passwordUpdated: "Senha Atualizada!",
    passwordUpdatedDesc: "Sua senha foi alterada com sucesso.",
    setup2FA: "Configurar 2FA",
    scan2FAQr: "Escanear Código QR",
    scan2FADesc: "Escaneie este código QR com seu app autenticador (Google Authenticator, Authy, etc.)",
    manualEntry: "Entrada Manual",
    secretKey: "Chave Secreta",
    enterCode: "Digite o Código",
    enter6Digit: "Digite o código de 6 dígitos do seu app",
    verify: "Verificar e Ativar",
    twoFAEnabled: "2FA Ativado!",
    twoFAEnabledDesc: "Sua conta agora está protegida com autenticação de dois fatores.",
    backupCodes: "Códigos de Backup",
    backupCodesDesc: "Salve esses códigos em um lugar seguro. Use-os para acessar sua conta se perder seu telefone.",
    done: "Concluir",
    copied: "Copiado!",
    back: "Voltar",
    device: "Dispositivo",
    location: "Localização",
    time: "Horário",
    current: "Atual",
    disable2FA: "Desativar 2FA",
    disable2FADesc: "Digite sua senha para desativar a autenticação de dois fatores.",
    disableConfirm: "Desativar 2FA",
    password: "Senha",
    wrongPassword: "Senha incorreta",
    incorrectCode: "Código de verificação incorreto",
    loading: "Carregando...",
  },
};

export default function Security() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<SecurityView>("main");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const t = translations[language as "en" | "pt-BR"] || translations.en;

  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const status = await get2FAStatus();
        setIs2FAEnabled(status.enabled);
      } catch (error) {
        console.error("Failed to fetch 2FA status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch2FAStatus();
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="p-6 flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AnimatePresence mode="wait">
        {view === "main" && (
          <MainSecurityView 
            key="main"
            t={t}
            setLocation={setLocation}
            setView={setView}
            is2FAEnabled={is2FAEnabled}
            setIs2FAEnabled={setIs2FAEnabled}
            isBiometricEnabled={isBiometricEnabled}
            setIsBiometricEnabled={setIsBiometricEnabled}
          />
        )}
        {view === "change-password" && (
          <ChangePasswordView key="password" t={t} setView={setView} />
        )}
        {view === "setup-2fa" && (
          <Setup2FAView key="2fa" t={t} setView={setView} onComplete={() => setIs2FAEnabled(true)} />
        )}
        {view === "disable-2fa" && (
          <Disable2FAView key="disable-2fa" t={t} setView={setView} onComplete={() => setIs2FAEnabled(false)} />
        )}
        {view === "login-history" && (
          <LoginHistoryView key="history" t={t} setView={setView} />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

function MainSecurityView({ t, setLocation, setView, is2FAEnabled, setIs2FAEnabled, isBiometricEnabled, setIsBiometricEnabled }: any) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAllSessions();
      toast.success(t.signOutAll + " - Success");
      // Logout current session and redirect
      await logout();
      setLocation("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout all sessions");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 flex flex-col h-full space-y-8"
    >
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
        <button 
          onClick={() => setLocation("/profile")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg tracking-wide">{t.securityCenter}</h1>
        <div className="w-10" />
      </div>
      
      <div className={cn(
        "p-[1px] rounded-3xl shadow-[0_0_30px_rgba(139,92,246,0.15)]",
        is2FAEnabled 
          ? "bg-gradient-to-br from-primary via-[#7c3aed] to-accent"
          : "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
      )}>
        <div className="bg-background/95 backdrop-blur-xl rounded-[23px] p-6 flex items-center gap-5">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center border shadow-inner",
            is2FAEnabled 
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          )}>
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg font-display">
              {is2FAEnabled ? t.highSecurity : t.mediumSecurity}
            </h3>
            <p className="text-sm text-muted-foreground">
              {is2FAEnabled ? t.highSecurityDesc : t.mediumSecurityDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">{t.authentication}</h2>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <div 
              className="p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => !is2FAEnabled && setView("setup-2fa")}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  is2FAEnabled ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5"
                )}>
                  <Smartphone className={cn("w-5 h-5", is2FAEnabled ? "text-green-500" : "text-white")} />
                </div>
                <div>
                  <p className="text-sm font-bold">{t.twoFactorAuth}</p>
                  <p className="text-xs text-muted-foreground">{t.googleAuth}</p>
                </div>
              </div>
              <Switch 
                checked={is2FAEnabled} 
                onCheckedChange={(checked) => {
                  if (checked) {
                    setView("setup-2fa");
                  } else {
                    setView("disable-2fa");
                  }
                }}
                className="data-[state=checked]:bg-green-500" 
                data-testid="switch-2fa"
              />
            </div>
            
            <div className="p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  isBiometricEnabled ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5"
                )}>
                  <Lock className={cn("w-5 h-5", isBiometricEnabled ? "text-green-500" : "text-white")} />
                </div>
                <div>
                  <p className="text-sm font-bold">{t.biometricLogin}</p>
                  <p className="text-xs text-muted-foreground">{t.faceTouch}</p>
                </div>
              </div>
              <Switch 
                checked={isBiometricEnabled} 
                onCheckedChange={setIsBiometricEnabled}
                className="data-[state=checked]:bg-green-500" 
                data-testid="switch-biometric"
              />
            </div>

            <button 
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
              onClick={() => setView("change-password")}
              data-testid="button-change-password"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                  <Key className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">{t.changePassword}</p>
                  <p className="text-xs text-muted-foreground">{t.lastChanged}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">{t.activity}</h2>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <button 
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
              onClick={() => setView("login-history")}
              data-testid="button-login-history"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                  <History className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">{t.loginHistory}</p>
                  <p className="text-xs text-muted-foreground">{t.viewDevices}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={handleLogoutAll}
        disabled={isLoggingOut}
        className="w-full h-14 rounded-2xl text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 font-bold text-base mt-auto disabled:opacity-50"
        data-testid="button-signout-all"
      >
        {isLoggingOut ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5 mr-2" />
        )}
        {t.signOutAll}
      </Button>
    </motion.div>
  );
}

function ChangePasswordView({ t, setView }: { t: any; setView: (view: SecurityView) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const isValid = currentPassword.length >= 1 && 
                  newPassword.length >= 8 && 
                  /\d/.test(newPassword) && 
                  newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");
    
    try {
      await changePassword(currentPassword, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 flex flex-col h-full min-h-[80vh] items-center justify-center"
      >
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">{t.passwordUpdated}</h2>
            <p className="text-muted-foreground text-sm">{t.passwordUpdatedDesc}</p>
          </div>

          <Button 
            onClick={() => setView("main")}
            className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-primary to-[#7c3aed]"
            data-testid="button-done"
          >
            {t.done}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 flex flex-col h-full space-y-8"
    >
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
        <button 
          onClick={() => setView("main")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg tracking-wide">{t.changePassword}</h1>
        <div className="w-10" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t.currentPassword}</label>
          <div className="relative">
            <Input 
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-14 bg-white/5 border-white/10 rounded-xl pr-12 text-base"
              placeholder="••••••••"
              data-testid="input-current-password"
            />
            <button 
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t.newPassword}</label>
          <div className="relative">
            <Input 
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-14 bg-white/5 border-white/10 rounded-xl pr-12 text-base"
              placeholder="••••••••"
              data-testid="input-new-password"
            />
            <button 
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t.passwordRequirements}</p>
          
          <div className="flex gap-2 mt-2">
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              newPassword.length >= 8 ? "bg-green-500" : "bg-white/10"
            )} />
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              /\d/.test(newPassword) ? "bg-green-500" : "bg-white/10"
            )} />
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              /[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-white/10"
            )} />
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              /[!@#$%^&*]/.test(newPassword) ? "bg-green-500" : "bg-white/10"
            )} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t.confirmPassword}</label>
          <div className="relative">
            <Input 
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "h-14 bg-white/5 border-white/10 rounded-xl pr-12 text-base",
                confirmPassword && newPassword !== confirmPassword && "border-red-500/50"
              )}
              placeholder="••••••••"
              data-testid="input-confirm-password"
            />
            <button 
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Passwords do not match
            </p>
          )}
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-primary to-[#7c3aed] mt-auto disabled:opacity-50"
        data-testid="button-update-password"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          t.updatePassword
        )}
      </Button>
    </motion.div>
  );
}

function Setup2FAView({ t, setView, onComplete }: { t: any; setView: (view: SecurityView) => void; onComplete: () => void }) {
  const [step, setStep] = useState<"loading" | "scan" | "verify" | "backup">("loading");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [secretKey, setSecretKey] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    const init2FA = async () => {
      try {
        const data = await setup2FA();
        setSecretKey(data.secret);
        setOtpAuthUrl(data.otpAuthUrl);
        setBackupCodes(data.backupCodes);
        setStep("scan");
      } catch (err: any) {
        toast.error(err.message || "Failed to setup 2FA");
        setView("main");
      }
    };
    init2FA();
  }, []);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    setIsVerifying(true);
    setError("");
    
    try {
      await verify2FA(verificationCode);
      setStep("backup");
    } catch (err: any) {
      setError(err.message || t.incorrectCode);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    setView("main");
    toast.success(t.twoFAEnabled);
  };

  if (step === "loading") {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 flex flex-col h-full min-h-[80vh] items-center justify-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">{t.loading}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 flex flex-col h-full min-h-[80vh]"
    >
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5 mb-8">
        <button 
          onClick={() => step === "scan" ? setView("main") : setStep("scan")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg tracking-wide">{t.setup2FA}</h1>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {step === "scan" && (
          <motion.div 
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold font-display">{t.scan2FAQr}</h2>
              <p className="text-sm text-muted-foreground">{t.scan2FADesc}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl mx-auto shadow-2xl">
              <QRCode 
                value={otpAuthUrl} 
                size={200}
                level="H"
              />
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-muted-foreground mb-2">{t.manualEntry}</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-primary tracking-wider break-all">{secretKey}</code>
                <button 
                  onClick={handleCopySecret}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
                  data-testid="button-copy-secret"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              onClick={() => setStep("verify")}
              className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-primary to-[#7c3aed] mt-auto"
              data-testid="button-next"
            >
              {t.enterCode}
            </Button>
          </motion.div>
        )}

        {step === "verify" && (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold font-display">{t.enterCode}</h2>
              <p className="text-sm text-muted-foreground">{t.enter6Digit}</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={verificationCode[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val) {
                      const newCode = verificationCode.slice(0, i) + val + verificationCode.slice(i + 1);
                      setVerificationCode(newCode.slice(0, 6));
                      if (i < 5) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !verificationCode[i] && i > 0) {
                      const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                      prev?.focus();
                    }
                  }}
                  className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  data-testid={`input-code-${i}`}
                />
              ))}
            </div>

            <Button 
              onClick={handleVerify}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-primary to-[#7c3aed] mt-auto disabled:opacity-50"
              data-testid="button-verify"
            >
              {isVerifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.verify
              )}
            </Button>
          </motion.div>
        )}

        {step === "backup" && (
          <motion.div 
            key="backup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col space-y-6"
          >
            <div className="relative mx-auto w-fit mb-4">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold font-display">{t.backupCodes}</h2>
              <p className="text-sm text-muted-foreground">{t.backupCodesDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code, i) => (
                <div 
                  key={i}
                  className="glass-card rounded-xl p-3 text-center font-mono text-sm border border-white/10"
                >
                  {code}
                </div>
              ))}
            </div>

            <Button 
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join("\n"));
                toast.success(t.copied);
              }}
              className="w-full h-12 rounded-xl border-white/20"
              data-testid="button-copy-codes"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All Codes
            </Button>

            <Button 
              onClick={handleComplete}
              className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-primary to-[#7c3aed]"
              data-testid="button-done"
            >
              {t.done}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Disable2FAView({ t, setView, onComplete }: { t: any; setView: (view: SecurityView) => void; onComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDisable = async () => {
    if (!password) return;
    setIsLoading(true);
    setError("");

    try {
      await disable2FA(password);
      onComplete();
      setView("main");
      toast.success("2FA disabled");
    } catch (err: any) {
      setError(err.message || t.wrongPassword);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 flex flex-col h-full space-y-8"
    >
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
        <button 
          onClick={() => setView("main")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg tracking-wide">{t.disable2FA}</h1>
        <div className="w-10" />
      </div>

      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <Smartphone className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground">{t.disable2FADesc}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{t.password}</label>
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 bg-white/5 border-white/10 rounded-xl pr-12 text-base"
            placeholder="••••••••"
            data-testid="input-password"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button 
        onClick={handleDisable}
        disabled={!password || isLoading}
        className="w-full h-14 rounded-2xl font-bold text-base bg-red-500 hover:bg-red-600 mt-auto disabled:opacity-50"
        data-testid="button-disable-2fa"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          t.disableConfirm
        )}
      </Button>
    </motion.div>
  );
}

function LoginHistoryView({ t, setView }: { t: any; setView: (view: SecurityView) => void }) {
  const loginHistory = [
    { device: "iPhone 14 Pro", location: "São Paulo, BR", time: "Now", current: true },
    { device: "MacBook Pro", location: "São Paulo, BR", time: "2 hours ago", current: false },
    { device: "Windows PC", location: "Rio de Janeiro, BR", time: "Yesterday", current: false },
    { device: "iPad Pro", location: "São Paulo, BR", time: "3 days ago", current: false },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 flex flex-col h-full space-y-6"
    >
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
        <button 
          onClick={() => setView("main")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg tracking-wide">{t.loginHistory}</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-3">
        {loginHistory.map((session, i) => (
          <div 
            key={i}
            className={cn(
              "glass-card rounded-2xl p-4 border",
              session.current ? "border-primary/30 bg-primary/5" : "border-white/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  session.current ? "bg-primary/10" : "bg-white/5"
                )}>
                  <Smartphone className={cn(
                    "w-5 h-5",
                    session.current ? "text-primary" : "text-white"
                  )} />
                </div>
                <div>
                  <p className="text-sm font-bold">{session.device}</p>
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                </div>
              </div>
              <div className="text-right">
                {session.current ? (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {t.current}
                  </span>
                ) : (
                  <p className="text-xs text-muted-foreground">{session.time}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
