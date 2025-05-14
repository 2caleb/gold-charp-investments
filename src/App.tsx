
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StaffRoute from "@/components/auth/StaffRoute";

import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Properties from "./pages/Properties";
import Loans from "./pages/Loans";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DataCollectionDashboard from "./pages/staff/DataCollectionDashboard";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import ClientsList from "./pages/ClientsList";
import NewClient from "./pages/NewClient";
import ClientDetail from "./pages/ClientDetail";
import NewLoanApplication from "./pages/NewLoanApplication";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="goldcharp-theme">
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/loans" element={<Loans />} />
              
              {/* Protected routes */}
              <Route path="/clients" element={
                <StaffRoute>
                  <ClientsList />
                </StaffRoute>
              } />
              <Route path="/clients/new" element={
                <StaffRoute>
                  <NewClient />
                </StaffRoute>
              } />
              <Route path="/clients/:id" element={
                <StaffRoute>
                  <ClientDetail />
                </StaffRoute>
              } />
              <Route path="/loan-applications/new" element={
                <StaffRoute>
                  <NewLoanApplication />
                </StaffRoute>
              } />
              
              {/* Staff-only routes */}
              <Route path="/staff/data-collection" element={
                <StaffRoute>
                  <DataCollectionDashboard />
                </StaffRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
