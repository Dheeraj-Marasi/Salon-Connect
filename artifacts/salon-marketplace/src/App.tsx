import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { CompareProvider } from "@/contexts/compare-context";
import { CompareBar } from "@/components/compare-bar";
import { Chatbot } from "@/components/chatbot";
import NotFound from "@/pages/not-found";

import HomePage from "@/pages/home";
import SalonsPage from "@/pages/salons";
import SalonDetailPage from "@/pages/salon-detail";
import CategoriesPage from "@/pages/categories";
import BookingFlowPage from "@/pages/booking-flow";
import BookingsPage from "@/pages/bookings";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import AccountPage from "@/pages/account";
import ComparePage from "@/pages/compare";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/salons" component={SalonsPage} />
        <Route path="/salons/:id" component={SalonDetailPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/book/:salonId" component={BookingFlowPage} />
        <Route path="/bookings" component={BookingsPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/account" component={AccountPage} />
        <Route path="/compare" component={ComparePage} />
        <Route component={NotFound} />
      </Switch>
      <CompareBar />
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <CompareProvider>
              <Router />
            </CompareProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
