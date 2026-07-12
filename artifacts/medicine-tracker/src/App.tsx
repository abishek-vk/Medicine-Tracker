import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, getStoredToken } from "@/lib/auth-context";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import Medicines from "@/pages/medicines/index";
import NewMedicine from "@/pages/medicines/new";
import MedicineDetail from "@/pages/medicines/detail";
import EditMedicine from "@/pages/medicines/edit";
import Scanner from "@/pages/scanner";
import Reports from "@/pages/reports";

// Wire the stored token into the API client
setAuthTokenGetter(() => getStoredToken());

const queryClient = new QueryClient();

/**
 * Wraps children inside Layout only when authenticated.
 */
function LayoutIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token) return <>{children}</>;
  return <Layout>{children}</Layout>;
}

function Router() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If authenticated, redirect root to dashboard
  if (token) {
    return (
      <Switch>
        <Route path="/login" component={() => <Redirect to="/dashboard" />} />
        <Route path="/signup" component={() => <Redirect to="/dashboard" />} />
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/dashboard">{() => <Layout><Dashboard /></Layout>}</Route>
        <Route path="/medicines">{() => <Layout><Medicines /></Layout>}</Route>
        <Route path="/medicines/new">{() => <Layout><NewMedicine /></Layout>}</Route>
        <Route path="/medicines/:id">{() => <Layout><MedicineDetail /></Layout>}</Route>
        <Route path="/medicines/:id/edit">{() => <Layout><EditMedicine /></Layout>}</Route>
        <Route path="/scanner">{() => <Layout><Scanner /></Layout>}</Route>
        <Route path="/reports">{() => <Layout><Reports /></Layout>}</Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Not authenticated — show login/signup pages
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route component={() => <Redirect to="/login" />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
