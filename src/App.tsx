
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import NewLoanApplication from '@/pages/NewLoanApplication';
import LoanApprovalPage from '@/pages/LoanApprovalPage';
import ClientsList from '@/pages/ClientsList';
import ClientDetail from '@/pages/ClientDetail';
import NewClient from '@/pages/NewClient';
import Payments from '@/pages/Payments';
import ReportsPage from '@/pages/ReportsPage';
import NotFound from '@/pages/NotFound';
import DataCollectionDashboard from '@/pages/staff/DataCollectionDashboard';
import StaffRoute from '@/components/auth/StaffRoute';
import PremiumDashboard from '@/pages/PremiumDashboard';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/new-loan-application" 
                  element={
                    <PrivateRoute>
                      <NewLoanApplication />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/loan-approval/:id" 
                  element={
                    <PrivateRoute>
                      <LoanApprovalPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/clients" 
                  element={
                    <PrivateRoute>
                      <ClientsList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/client/:id" 
                  element={
                    <PrivateRoute>
                      <ClientDetail />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/new-client" 
                  element={
                    <PrivateRoute>
                      <NewClient />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/payments" 
                  element={
                    <PrivateRoute>
                      <Payments />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute>
                      <ReportsPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/premium-dashboard" 
                  element={
                    <PrivateRoute>
                      <PremiumDashboard />
                    </PrivateRoute>
                  } 
                />

                {/* Staff Routes */}
                <Route 
                  path="/staff/data-collection" 
                  element={
                    <StaffRoute>
                      <DataCollectionDashboard />
                    </StaffRoute>
                  } 
                />

                {/* Catch all route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
