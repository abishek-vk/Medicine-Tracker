import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import Medicines from "@/pages/medicines/index";
import NewMedicine from "@/pages/medicines/new";
import MedicineDetail from "@/pages/medicines/detail";
import EditMedicine from "@/pages/medicines/edit";
import Scanner from "@/pages/scanner";
import Reports from "@/pages/reports";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/medicines" component={Medicines} />
        <Route path="/medicines/new" component={NewMedicine} />
        <Route path="/medicines/:id" component={MedicineDetail} />
        <Route path="/medicines/:id/edit" component={EditMedicine} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
