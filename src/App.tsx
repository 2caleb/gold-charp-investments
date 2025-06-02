
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import StaffRoute from "@/components/auth/StaffRoute";
import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

// Public pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Loans from "./pages/Loans";
import Properties from "./pages/Properties";
import Calculator from "./pages/Calculator";
import PropertyEvaluation from "./pages/PropertyEvaluation";
import Services from "./pages/services";
import ServiceDetail from "./pages/services/ServiceDetail";
import BusinessSupport from "./pages/services/BusinessSupport";
import FastTrack from "./pages/services/FastTrack";
import Insurance from "./pages/services/Insurance";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import MoneyTransfer from "./pages/MoneyTransfer";

// Protected pages
import Dashboard from "./pages/Dashboard";
import ClientsList from "./pages/ClientsList";
import ClientDetail from "./pages/ClientDetail";
import NewClient from "./pages/NewClient";
import LoanApplicationsList from "./pages/LoanApplicationsList";
import NewLoanApplication from "./pages/NewLoanApplication";
import LoanApprovalPage from "./pages/LoanApprovalPage";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import ReportsPage from "./pages/ReportsPage";
import Payments from "./pages/Payments";

// Staff pages
import DataCollection from "./pages/staff/DataCollection";
import DataCollectionDashboard from "./pages/staff/DataCollectionDashboard";
import ManagerReviewDashboard from "./pages/staff/ManagerReviewDashboard";
import DirectorRiskDashboard from "./pages/staff/DirectorRiskDashboard";
import CEOApprovalDashboard from "./pages/staff/CEOApprovalDashboard";
import ChairpersonFinalDashboard from "./pages/staff/ChairpersonFinalDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/property-evaluation" element={<PropertyEvaluation />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:serviceId" element={<ServiceDetail />} />
                  <Route path="/services/business-support" element={<BusinessSupport />} />
                  <Route path="/services/fast-track" element={<FastTrack />} />
                  <Route path="/services/insurance" element={<Insurance />} />
                  <Route path="/money-transfer" element={<MoneyTransfer />} />
                  
                  {/* Auth routes - only accessible when not logged in */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                  {/* Protected routes - require authentication */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clients" element={<ClientsList />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    <Route path="/new-client" element={<NewClient />} />
                    <Route path="/loan-applications" element={<LoanApplicationsList />} />
                    <Route path="/new-loan-application" element={<NewLoanApplication />} />
                    <Route path="/loan-approval/:id" element={<LoanApprovalPage />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/payments" element={<Payments />} />
                  </Route>

                  {/* Staff-only routes */}
                  <Route element={<StaffRoute />}>
                    <Route path="/staff/data-collection" element={<DataCollection />} />
                    <Route path="/staff/data-collection-dashboard" element={<DataCollectionDashboard />} />
                  </Route>

                  {/* Role-based routes */}
                  <Route element={<RoleBasedRoute allowedRoles={['manager', 'director', 'ceo', 'chairperson']} />}>
                    <Route path="/staff/manager-review" element={<ManagerReviewDashboard />} />
                  </Route>

                  <Route element={<RoleBasedRoute allowedRoles={['director', 'ceo', 'chairperson']} />}>
                    <Route path="/staff/director-risk" element={<DirectorRiskDashboard />} />
                  </Route>

                  <Route element={<RoleBasedRoute allowedRoles={['ceo', 'chairperson']} />}>
                    <Route path="/staff/ceo-approval" element={<CEOApprovalDashboard />} />
                  </Route>

                  <Route element={<RoleBasedRoute allowedRoles={['chairperson']} />}>
                    <Route path="/staff/chairperson-final" element={<ChairpersonFinalDashboard />} />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
