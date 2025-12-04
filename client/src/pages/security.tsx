import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Shield, Lock, Smartphone, Eye, EyeOff, Key, LogOut, ChevronRight, Fingerprint, Bell, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Security() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const [settings, setSettings] = useState({
    twoFactor: false,
    biometric: true,
    loginAlerts: true,
    transactionAlerts: true,
  });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const sessions = [
    { device: "iPhone 15 Pro", location: "São Paulo, BR", current: true, lastActive: "Now" },
    { device: "MacBook Pro", location: "São Paulo, BR", current: false, lastActive: "2h ago" },
    { device: "Chrome on Windows", location: "Rio de Janeiro, BR", current: false, lastActive: "1 day ago" },
  ];

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(isPortuguese ? "Configuração atualizada" : "Setting updated");
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error(isPortuguese ? "Preencha todos os campos" : "Fill all fields");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error(isPortuguese ? "Senhas não coincidem" : "Passwords don't match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error(isPortuguese ? "Mínimo 8 caracteres" : "Minimum 8 characters");
      return;
    }
    toast.success(isPortuguese ? "Senha alterada com sucesso!" : "Password changed successfully!");
    setPasswordDialogOpen(false);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleLogoutSession = (index: number) => {
    toast.success(isPortuguese ? "Sessão encerrada" : "Session terminated");
  };

  const securityItems = [
    {
      icon: Lock,
      title: isPortuguese ? "Alterar Senha" : "Change Password",
      description: isPortuguese ? "Atualize sua senha de acesso" : "Update your access password",
      action: () => setPasswordDialogOpen(true),
      type: "button" as const,
    },
    {
      icon: Smartphone,
      title: isPortuguese ? "Autenticação 2FA" : "Two-Factor Auth",
      description: isPortuguese ? "Proteção extra com código SMS" : "Extra protection with SMS code",
      value: settings.twoFactor,
      action: () => toggleSetting("twoFactor"),
      type: "toggle" as const,
    },
    {
      icon: Fingerprint,
      title: isPortuguese ? "Biometria" : "Biometric Login",
      description: isPortuguese ? "Use impressão digital ou Face ID" : "Use fingerprint or Face ID",
      value: settings.biometric,
      action: () => toggleSetting("biometric"),
      type: "toggle" as const,
    },
    {
      icon: Bell,
      title: isPortuguese ? "Alertas de Login" : "Login Alerts",
      description: isPortuguese ? "Notificação ao fazer login" : "Notify on new login",
      value: settings.loginAlerts,
      action: () => toggleSetting("loginAlerts"),
      type: "toggle" as const,
    },
    {
      icon: Key,
      title: isPortuguese ? "Alertas de Transação" : "Transaction Alerts",
      description: isPortuguese ? "Notificar em cada transação" : "Notify on each transaction",
      value: settings.transactionAlerts,
      action: () => toggleSetting("transactionAlerts"),
      type: "toggle" as const,
    },
  ];

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
            {isPortuguese ? "Segurança" : "Security"}
          </h1>
          <div className="w-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-3xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {isPortuguese ? "Conta Protegida" : "Account Protected"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPortuguese 
                  ? "Sua conta está com proteção básica ativa" 
                  : "Your account has basic protection active"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-sm">70%</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {isPortuguese ? "Configurações de Segurança" : "Security Settings"}
          </h3>

          <div className="space-y-2">
            {securityItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="premium-card rounded-2xl p-4 hover:bg-white/[0.02] transition-all cursor-pointer"
                onClick={item.type === "button" ? item.action : undefined}
                data-testid={`button-security-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === "toggle" ? (
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.action}
                      data-testid={`switch-security-${index}`}
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {isPortuguese ? "Sessões Ativas" : "Active Sessions"}
            </h3>
            <button 
              className="text-xs text-red-400 hover:text-red-300 font-medium"
              onClick={() => toast.success(isPortuguese ? "Todas as sessões encerradas" : "All sessions terminated")}
              data-testid="button-logout-all"
            >
              {isPortuguese ? "Sair de Todas" : "Logout All"}
            </button>
          </div>

          <div className="space-y-2">
            {sessions.map((session, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={cn(
                  "premium-card rounded-2xl p-4",
                  session.current && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center border",
                    session.current 
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white/[0.04] border-white/[0.08] text-muted-foreground"
                  )}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{session.device}</p>
                      {session.current && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                          {isPortuguese ? "Este dispositivo" : "This device"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{session.location}</span>
                      <span>•</span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleLogoutSession(index)}
                      className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all border border-red-500/20"
                      data-testid={`button-logout-session-${index}`}
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="premium-card border-white/[0.08] rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-xl font-semibold">
              {isPortuguese ? "Alterar Senha" : "Change Password"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {isPortuguese ? "Digite sua senha atual e a nova senha" : "Enter your current and new password"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">
                {isPortuguese ? "Senha Atual" : "Current Password"}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full premium-input p-4 pr-12"
                  placeholder="••••••••"
                  data-testid="input-current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">
                {isPortuguese ? "Nova Senha" : "New Password"}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                  className="w-full premium-input p-4 pr-12"
                  placeholder="••••••••"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">
                {isPortuguese ? "Confirmar Senha" : "Confirm Password"}
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full premium-input p-4"
                placeholder="••••••••"
                data-testid="input-confirm-password"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              className="w-full h-12 rounded-2xl premium-button"
              data-testid="button-change-password"
            >
              {isPortuguese ? "Alterar Senha" : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
