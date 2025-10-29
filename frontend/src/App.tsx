import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import VerifyLoginOTP from "./pages/VerifyLoginOTP";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "@/lib/ProtectedRoute";
import Transactions from "./pages/Transactions";
import Transfer from "./pages/Transfer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Cards from "./pages/Cards";
import Savings from "./pages/Savings";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import AccountDetails from "./pages/AccountDetails";

/* Subpages */
import Send from "./pages/transfer/Send";
import Schedule from "./pages/transfer/Schedule";
import TransactionDetail from "./pages/transactions/TransactionDetail";
import CardDetail from "./pages/cards/CardDetail";
import RequestCard from "./pages/cards/RequestCard";
import GoalDetail from "./pages/savings/GoalDetail";
import SecurityCenter from "./pages/settings/SecurityCenter";
import PaymentMethods from "./pages/settings/PaymentMethods";
import FinancialSettings from "./pages/settings/FinancialSettings";
import GettingStarted from "./pages/help/GettingStarted";
import FAQ from "./pages/help/FAQ";
import NotificationsHistory from "./pages/notifications/History";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-login-otp" element={<VerifyLoginOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/:accountId"
            element={
              <ProtectedRoute>
                <AccountDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute>
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <Cards />
              </ProtectedRoute>
            }
          />
          <Route path="/cards/request" element={<RequestCard />} />
          <Route path="/cards/:id" element={<CardDetail />} />

          <Route
            path="/savings"
            element={
              <ProtectedRoute>
                <Savings />
              </ProtectedRoute>
            }
          />
          <Route path="/savings/:id" element={<GoalDetail />} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/settings/security" element={<SecurityCenter />} />
          <Route
            path="/settings/payment-methods"
            element={<PaymentMethods />}
          />
          <Route
            path="/settings/financial"
            element={
              <ProtectedRoute>
                <FinancialSettings />
              </ProtectedRoute>
            }
          />

          <Route path="/help" element={<Help />} />
          <Route path="/help/getting-started" element={<GettingStarted />} />
          <Route path="/help/faq" element={<FAQ />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications/history"
            element={<NotificationsHistory />}
          />

          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transfer/send" element={<Send />} />
          <Route path="/transfer/schedule" element={<Schedule />} />

          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
