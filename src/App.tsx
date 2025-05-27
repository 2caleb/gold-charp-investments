
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/loans",
    element: <Loans />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/calculator",
    element: <Calculator />,
  },
  {
    path: "/properties",
    element: <Properties />,
  },
  {
    path: "/property-evaluation",
    element: <PropertyEvaluation />,
  },
  {
    path: "/services",
    element: <ServicesIndex />,
  },
  {
    path: "/services/:serviceId",
    element: <ServiceDetail />,
  },
  {
    path: "/services/business-support",
    element: <BusinessSupport />,
  },
  {
    path: "/services/fast-track",
    element: <FastTrack />,
  },
  {
    path: "/services/insurance",
    element: <Insurance />,
  },
  {
    path: "/login",
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: "/register",
    element: <PublicRoute><Register /></PublicRoute>,
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
  },
  {
    path: "/clients",
    element: <PrivateRoute><ClientsList /></PrivateRoute>,
  },
  {
    path: "/clients/:id",
    element: <PrivateRoute><ClientDetail /></PrivateRoute>,
  },
  {
    path: "/new-client",
    element: <PrivateRoute><NewClient /></PrivateRoute>,
  },
  {
    path: "/new-loan-application",
    element: <PrivateRoute><NewLoanApplication /></PrivateRoute>,
  },
  {
    path: "/loan-applications",
    element: <PrivateRoute><LoanApplicationsList /></PrivateRoute>,
  },
  {
    path: "/loan-applications/:id",
    element: <PrivateRoute><LoanApprovalPage /></PrivateRoute>,
  },
  {
    path: "/payments",
    element: <PrivateRoute><Payments /></PrivateRoute>,
  },
  {
    path: "/documents",
    element: <PrivateRoute><Documents /></PrivateRoute>,
  },
  {
    path: "/notifications",
    element: <PrivateRoute><Notifications /></PrivateRoute>,
  },
  {
    path: "/reports",
    element: <PrivateRoute><ReportsPage /></PrivateRoute>,
  },
  {
    path: "/staff/data-collection",
    element: <StaffRoute><DataCollection /></StaffRoute>,
  },
  {
    path: "/staff/data-collection-dashboard",
    element: <StaffRoute><DataCollectionDashboard /></StaffRoute>,
  },
  {
    path: "/staff/manager-review",
    element: <RoleBasedRoute allowedRoles={['manager']}><ManagerReviewDashboard /></RoleBasedRoute>,
  },
  {
    path: "/staff/director-risk",
    element: <RoleBasedRoute allowedRoles={['director']}><DirectorRiskDashboard /></RoleBasedRoute>,
  },
  {
    path: "/staff/ceo-approval",
    element: <RoleBasedRoute allowedRoles={['ceo']}><CEOApprovalDashboard /></RoleBasedRoute>,
  },
  {
    path: "/staff/chairperson-approval",
    element: <RoleBasedRoute allowedRoles={['chairperson']}><ChairpersonFinalDashboard /></RoleBasedRoute>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <NotificationsProvider>
              <Toaster />
              <Sonner />
              <RouterProvider router={router} />
            </NotificationsProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
