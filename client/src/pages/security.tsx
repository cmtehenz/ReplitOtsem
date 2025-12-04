import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Shield, Lock, Smartphone, Eye, EyeOff, Key, LogOut, ChevronRight, Fingerprint, Bell, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSecuritySettings, updateSecuritySettings, getSessions, deleteSession, logoutAllSessions, changePassword, type SecuritySettings, type ActiveSession } from "@/lib/api";

export default function Security() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const isPortuguese = t("nav.home") === "Início";
  
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["securitySettings"],
    queryFn: getSecuritySettings,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<SecuritySettings>) => updateSecuritySettings(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["securitySettings"], data);
      toast.success(isPortuguese ? "Configuração atualizada" : "Setting updated");
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro ao atualizar" : "Failed to update");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(isPortuguese ? "Sessão encerrada" : "Session terminated");
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro ao encerrar sessão" : "Failed to terminate session");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => logoutAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(isPortuguese ? "Todas as sessões encerradas" : "All sessions terminated");
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro ao encerrar sessões" : "Failed to terminate sessions");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success(isPortuguese ? "Senha alterada com sucesso!" : "Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleSetting = (key: keyof Pick<SecuritySettings, "twoFactorEnabled" | "biometricEnabled" | "loginAlertsEnabled" | "transactionAlertsEnabled">) => {
    if (!settings) return;
    const newValue = !settings[key];
    updateSettingsMutation.mutate({ [key]: newValue });
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
    changePasswordMutation.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
  };

  const handleLogoutSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
  };

  const handleLogoutAll = () => {
    logoutAllMutation.mutate();
  };

  const getSecurityScore = (): number => {
    if (!settings) return 50;
    let score = 50;
    if (settings.twoFactorEnabled) score += 25;
    if (settings.biometricEnabled) score += 10;
    if (settings.loginAlertsEnabled) score += 10;
    if (settings.transactionAlertsEnabled) score += 5;
    return Math.min(score, 100);
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
      value: settings?.twoFactorEnabled ?? false,
      action: () => toggleSetting("twoFactorEnabled"),
      type: "toggle" as const,
    },
    {
      icon: Fingerprint,
      title: isPortuguese ? "Biometria" : "Biometric Login",
      description: isPortuguese ? "Use impressão digital ou Face ID" : "Use fingerprint or Face ID",
      value: settings?.biometricEnabled ?? true,
      action: () => toggleSetting("biometricEnabled"),
      type: "toggle" as const,
    },
    {
      icon: Bell,
      title: isPortuguese ? "Alertas de Login" : "Login Alerts",
      description: isPortuguese ? "Notificação ao fazer login" : "Notify on new login",
      value: settings?.loginAlertsEnabled ?? true,
      action: () => toggleSetting("loginAlertsEnabled"),
      type: "toggle" as const,
    },
    {
      icon: Key,
      title: isPortuguese ? "Alertas de Transação" : "Transaction Alerts",
      description: isPortuguese ? "Notificar em cada transação" : "Notify on each transaction",
      value: settings?.transactionAlertsEnabled ?? true,
      action: () => toggleSetting("transactionAlertsEnabled"),
      type: "toggle" as const,
    },
  ];

  const formatLastActive = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return isPortuguese ? "Agora" : "Now";
    if (diffMins < 60) return `${diffMins}m ${isPortuguese ? "atrás" : "ago"}`;
    if (diffHours < 24) return `${diffHours}h ${isPortuguese ? "atrás" : "ago"}`;
    return `${diffDays}d ${isPortuguese ? "atrás" : "ago"}`;
  };

  if (settingsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  const securityScore = getSecurityScore();

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
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border",
              securityScore >= 75 
                ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/20"
                : securityScore >= 50
                  ? "bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/20"
                  : "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/20"
            )}>
              <Shield className={cn(
                "w-7 h-7",
                securityScore >= 75 ? "text-emerald-400" : securityScore >= 50 ? "text-amber-400" : "text-red-400"
              )} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {securityScore >= 75 
                  ? (isPortuguese ? "Conta Protegida" : "Account Protected")
                  : securityScore >= 50
                    ? (isPortuguese ? "Proteção Básica" : "Basic Protection")
                    : (isPortuguese ? "Precisa de Atenção" : "Needs Attention")
                }
              </h2>
              <p className="text-sm text-muted-foreground">
                {securityScore >= 75 
                  ? (isPortuguese ? "Sua conta está bem protegida" : "Your account is well protected")
                  : (isPortuguese ? "Ative mais opções para melhor segurança" : "Enable more options for better security")
                }
              </p>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border",
              securityScore >= 75 
                ? "bg-emerald-500/10 border-emerald-500/20"
                : securityScore >= 50
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-red-500/10 border-red-500/20"
            )}>
              <span className={cn(
                "font-bold text-sm",
                securityScore >= 75 ? "text-emerald-400" : securityScore >= 50 ? "text-amber-400" : "text-red-400"
              )}>{securityScore}%</span>
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
                      disabled={updateSettingsMutation.isPending}
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
            {sessions.length > 1 && (
              <button 
                className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                onClick={handleLogoutAll}
                disabled={logoutAllMutation.isPending}
                data-testid="button-logout-all"
              >
                {logoutAllMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  isPortuguese ? "Sair de Todas" : "Logout All"
                )}
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="premium-card rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">
                {isPortuguese ? "Nenhuma sessão ativa encontrada" : "No active sessions found"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={cn(
                    "premium-card rounded-2xl p-4",
                    session.isCurrent && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border",
                      session.isCurrent 
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white/[0.04] border-white/[0.08] text-muted-foreground"
                    )}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{session.deviceName || session.deviceType}</p>
                        {session.isCurrent && (
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                            {isPortuguese ? "Este dispositivo" : "This device"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location || session.ipAddress}</span>
                        <span>•</span>
                        <span>{formatLastActive(session.lastActiveAt)}</span>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        disabled={deleteSessionMutation.isPending}
                        className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all border border-red-500/20 disabled:opacity-50"
                        data-testid={`button-logout-session-${session.id}`}
                      >
                        {deleteSessionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <LogOut className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
              disabled={changePasswordMutation.isPending}
              className="w-full h-12 rounded-2xl premium-button"
              data-testid="button-change-password"
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isPortuguese ? "Alterar Senha" : "Change Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
