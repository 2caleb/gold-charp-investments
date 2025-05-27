
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import StaffRoute from "./components/auth/StaffRoute";

// Import all pages
import Index from "./pages/Index";
import About from "./pages/About";
import Loans from "./pages/Loans";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import Properties from "./pages/Properties";
import PropertyEvaluation from "./pages/PropertyEvaluation";
import ClientsList from "./pages/ClientsList";
import ClientDetail from "./pages/ClientDetail";
import NewClient from "./pages/NewClient";
import NewLoanApplication from "./pages/NewLoanApplication";
import LoanApplicationsList from "./pages/LoanApplicationsList";
import LoanApprovalPage from "./pages/LoanApprovalPage";
import Payments from "./pages/Payments";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

// Staff pages
import DataCollection from "./pages/staff/DataCollection";
import DataCollectionDashboard from "./pages/staff/DataCollectionDashboard";
import ManagerReviewDashboard from "./pages/staff/ManagerReviewDashboard";
import DirectorRiskDashboard from "./pages/staff/DirectorRiskDashboard";
import CEOApprovalDashboard from "./pages/staff/CEOApprovalDashboard";
import ChairpersonFinalDashboard from "./pages/staff/ChairpersonFinalDashboard";

// Services pages
import ServicesIndex from "./pages/services";
import ServiceDetail from "./pages/services/ServiceDetail";
import BusinessSupport from "./pages/services/BusinessSupport";
import FastTrack from "./pages/services/FastTrack";
import Insurance from "./pages/services/Insurance";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <NotificationsProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/property-evaluation" element={<PropertyEvaluation />} />
                  
                  {/* Services routes */}
                  <Route path="/services" element={<ServicesIndex />} />
                  <Route path="/services/:serviceId" element={<ServiceDetail />} />
                  <Route path="/services/business-support" element={<BusinessSupport />} />
                  <Route path="/services/fast-track" element={<FastTrack />} />
                  <Route path="/services/insurance" element={<Insurance />} />

                  {/* Auth routes */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                  {/* Protected routes */}
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/clients" element={<PrivateRoute><ClientsList /></PrivateRoute>} />
                  <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
                  <Route path="/new-client" element={<PrivateRoute><NewClient /></PrivateRoute>} />
                  <Route path="/new-loan-application" element={<PrivateRoute><NewLoanApplication /></PrivateRoute>} />
                  <Route path="/loan-applications" element={<PrivateRoute><LoanApplicationsList /></PrivateRoute>} />
                  <Route path="/loan-applications/:id" element={<PrivateRoute><LoanApprovalPage /></PrivateRoute>} />
                  <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
                  <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
                  <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                  <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />

                  {/* Staff routes with role-based access */}
                  <Route path="/staff/data-collection" element={<StaffRoute><DataCollection /></StaffRoute>} />
                  <Route path="/staff/data-collection-dashboard" element={<StaffRoute><DataCollectionDashboard /></StaffRoute>} />
                  <Route path="/staff/manager-review" element={<RoleBasedRoute allowedRoles={['manager']}><ManagerReviewDashboard /></RoleBasedRoute>} />
                  <Route path="/staff/director-risk" element={<RoleBasedRoute allowedRoles={['director']}><DirectorRiskDashboard /></RoleBasedRoute>} />
                  <Route path="/staff/ceo-approval" element={<RoleBasedRoute allowedRoles={['ceo']}><CEOApprovalDashboard /></RoleBasedRoute>} />
                  <Route path="/staff/chairperson-approval" element={<RoleBasedRoute allowedRoles={['chairperson']}><ChairpersonFinalDashboard /></RoleBasedRoute>} />

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NotificationsProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
