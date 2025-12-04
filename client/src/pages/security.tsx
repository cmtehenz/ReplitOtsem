import { useState } from "react";
import { ArrowLeft, Shield, Lock, Smartphone, Eye, EyeOff, Key, LogOut, ChevronRight, Fingerprint, Bell, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
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
      toast.error(isPortuguese ? "Erro" : "Failed");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => logoutAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(isPortuguese ? "Todas encerradas" : "All terminated");
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro" : "Failed");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success(isPortuguese ? "Senha alterada!" : "Password changed!");
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
      description: isPortuguese ? "Atualize sua senha" : "Update your password",
      action: () => setPasswordDialogOpen(true),
      type: "button" as const,
    },
    {
      icon: Smartphone,
      title: isPortuguese ? "Autenticação 2FA" : "Two-Factor Auth",
      description: isPortuguese ? "Proteção extra" : "Extra protection",
      value: settings?.twoFactorEnabled ?? false,
      action: () => toggleSetting("twoFactorEnabled"),
      type: "toggle" as const,
    },
    {
      icon: Fingerprint,
      title: isPortuguese ? "Biometria" : "Biometric Login",
      description: isPortuguese ? "Face ID / Touch ID" : "Face ID / Touch ID",
      value: settings?.biometricEnabled ?? true,
      action: () => toggleSetting("biometricEnabled"),
      type: "toggle" as const,
    },
    {
      icon: Bell,
      title: isPortuguese ? "Alertas de Login" : "Login Alerts",
      description: isPortuguese ? "Notificação ao logar" : "Notify on login",
      value: settings?.loginAlertsEnabled ?? true,
      action: () => toggleSetting("loginAlertsEnabled"),
      type: "toggle" as const,
    },
    {
      icon: Key,
      title: isPortuguese ? "Alertas de Transação" : "Transaction Alerts",
      description: isPortuguese ? "Notificar transações" : "Notify transactions",
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
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const securityScore = getSecurityScore();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isPortuguese ? "Segurança" : "Security"}
          </h1>
          <div className="w-10" />
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              securityScore >= 75 ? "bg-emerald-50" : securityScore >= 50 ? "bg-amber-50" : "bg-red-50"
            )}>
              <Shield className={cn(
                "w-7 h-7",
                securityScore >= 75 ? "text-emerald-600" : securityScore >= 50 ? "text-amber-600" : "text-red-600"
              )} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">
                {securityScore >= 75 
                  ? (isPortuguese ? "Conta Protegida" : "Protected")
                  : securityScore >= 50
                    ? (isPortuguese ? "Proteção Básica" : "Basic Protection")
                    : (isPortuguese ? "Precisa Atenção" : "Needs Attention")
                }
              </h2>
              <p className="text-sm text-gray-500">
                {securityScore >= 75 
                  ? (isPortuguese ? "Sua conta está segura" : "Your account is secure")
                  : (isPortuguese ? "Ative mais opções" : "Enable more options")
                }
              </p>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              securityScore >= 75 ? "bg-emerald-50" : securityScore >= 50 ? "bg-amber-50" : "bg-red-50"
            )}>
              <span className={cn(
                "font-bold text-sm",
                securityScore >= 75 ? "text-emerald-600" : securityScore >= 50 ? "text-amber-600" : "text-red-600"
              )}>{securityScore}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
            {isPortuguese ? "Configurações" : "Settings"}
          </h3>

          <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
            {securityItems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 p-4",
                  item.type === "button" && "cursor-pointer hover:bg-gray-50"
                )}
                onClick={item.type === "button" ? item.action : undefined}
                data-testid={`button-security-${index}`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                {item.type === "toggle" ? (
                  <Switch
                    checked={item.value}
                    onCheckedChange={item.action}
                    disabled={updateSettingsMutation.isPending}
                    data-testid={`switch-security-${index}`}
                  />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {isPortuguese ? "Sessões Ativas" : "Active Sessions"}
            </h3>
            {sessions.length > 1 && (
              <button 
                className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                onClick={() => logoutAllMutation.mutate()}
                disabled={logoutAllMutation.isPending}
                data-testid="button-logout-all"
              >
                {logoutAllMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (isPortuguese ? "Sair de Todas" : "Logout All")}
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 card-shadow text-center">
              <p className="text-gray-500">{isPortuguese ? "Nenhuma sessão" : "No sessions"}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow divide-y divide-gray-50">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    session.isCurrent && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    session.isCurrent ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
                  )}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{session.deviceName || session.deviceType}</p>
                      {session.isCurrent && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {isPortuguese ? "Este" : "This"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{session.location || session.ipAddress}</span>
                      <span>•</span>
                      <span>{formatLastActive(session.lastActiveAt)}</span>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => deleteSessionMutation.mutate(session.id)}
                      disabled={deleteSessionMutation.isPending}
                      className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                      data-testid={`button-logout-session-${session.id}`}
                    >
                      {deleteSessionMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <LogOut className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-white border-0 rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              {isPortuguese ? "Alterar Senha" : "Change Password"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              {isPortuguese ? "Digite sua senha atual e a nova" : "Enter current and new password"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isPortuguese ? "Senha Atual" : "Current Password"}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="••••••••"
                  data-testid="input-current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isPortuguese ? "Nova Senha" : "New Password"}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                  className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="••••••••"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isPortuguese ? "Confirmar Senha" : "Confirm Password"}
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="••••••••"
                data-testid="input-confirm-password"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
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
    </div>
  );
}
