import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Activity from "@/pages/activity";
import KYCVerification from "@/pages/kyc";
import Auth from "@/pages/auth";
import ForgotPassword from "@/pages/forgot-password";
import ReferralProgram from "@/pages/referral";
import TransactionDetails from "@/pages/transaction-details";
import PixKeys from "@/pages/pix-keys";
import Notifications from "@/pages/notifications";
import Security from "@/pages/security";
import ExchangeSuccess from "@/pages/exchange-success";
import Wallet from "@/pages/wallet";
import PersonalInfo from "@/pages/personal-info";
import Cards from "@/pages/cards";
import Feed from "@/pages/feed";
import Welcome from "@/pages/welcome";
import VerifyEmail from "@/pages/verify-email";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={Welcome} />
      <Route path="/auth" component={Auth} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/personal-info">
        {() => <ProtectedRoute component={PersonalInfo} />}
      </Route>
      <Route path="/activity">
        {() => <ProtectedRoute component={Activity} />}
      </Route>
      <Route path="/kyc">
        {() => <ProtectedRoute component={KYCVerification} />}
      </Route>
      <Route path="/referral">
        {() => <ProtectedRoute component={ReferralProgram} />}
      </Route>
      <Route path="/transaction/:id">
        {() => <ProtectedRoute component={TransactionDetails} />}
      </Route>
      <Route path="/pix-keys">
        {() => <ProtectedRoute component={PixKeys} />}
      </Route>
      <Route path="/notifications">
        {() => <ProtectedRoute component={Notifications} />}
      </Route>
      <Route path="/security">
        {() => <ProtectedRoute component={Security} />}
      </Route>
      <Route path="/exchange-success">
        {() => <ProtectedRoute component={ExchangeSuccess} />}
      </Route>
      <Route path="/wallet">
        {() => <ProtectedRoute component={Wallet} />}
      </Route>
      <Route path="/cards">
        {() => <ProtectedRoute component={Cards} />}
      </Route>
      <Route path="/feed">
        {() => <ProtectedRoute component={Feed} />}
      </Route>
      <Route path="/verify-email">
        {() => <ProtectedRoute component={VerifyEmail} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
