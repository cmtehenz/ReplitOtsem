import { BottomNav } from "@/components/bottom-nav";
import { CustomizableDashboard } from "@/components/dashboard-widgets";
import { NotificationBell } from "@/components/notification-bell";
import { Settings, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setLocation("/profile")}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {isPortuguese ? "Bem-vindo" : "Welcome back"}
              </p>
              <p className="text-sm font-semibold text-gray-900" data-testid="text-username">
                {user?.name || user?.username || "User"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors" 
              onClick={() => setLocation("/profile")}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        <CustomizableDashboard />
      </main>

      <BottomNav active="home" />
    </div>
  );
}
