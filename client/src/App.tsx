import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import Home from "@/pages/Home";
import ListingDetails from "@/pages/ListingDetails";
import MyListings from "@/pages/MyListings";
import Applications from "@/pages/Applications";
import Profile from "@/pages/Profile";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { RoleSelectionDialog } from "@/components/RoleSelectionDialog";
import { Loader2 } from "lucide-react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <RoleSelectionDialog />
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/listings/:id" component={ListingDetails} />
        <Route path="/my-listings" component={MyListings} />
        <Route path="/applications" component={Applications} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
