import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Activity from "@/pages/activity";
import KYCVerification from "@/pages/kyc";
import Auth from "@/pages/auth";
import ReferralProgram from "@/pages/referral";
import TransactionDetails from "@/pages/transaction-details";
import PixKeys from "@/pages/pix-keys";
import Notifications from "@/pages/notifications";
import Security from "@/pages/security";
import ExchangeSuccess from "@/pages/exchange-success";
import Wallet from "@/pages/wallet";
import Cards from "@/pages/cards";
import Feed from "@/pages/feed";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={Welcome} />
      <Route path="/auth" component={Auth} />
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/activity" component={Activity} />
      <Route path="/kyc" component={KYCVerification} />
      <Route path="/referral" component={ReferralProgram} />
      <Route path="/transaction/:id" component={TransactionDetails} />
      <Route path="/pix-keys" component={PixKeys} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/security" component={Security} />
      <Route path="/exchange-success" component={ExchangeSuccess} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/cards" component={Cards} />
      <Route path="/feed" component={Feed} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
