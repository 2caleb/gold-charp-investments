import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { QueryClient } from '@/components/query-client';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import LoanApplication from '@/pages/LoanApplication';
import LoanApproval from '@/pages/LoanApproval';
import ClientManagement from '@/pages/ClientManagement';
import ClientDetails from '@/pages/ClientDetails';
import NewClient from '@/pages/NewClient';
import Payments from '@/pages/Payments';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import DataCollectionDashboard from '@/pages/staff/DataCollectionDashboard';
import StaffRoute from '@/components/auth/StaffRoute';
import PremiumDashboard from '@/pages/PremiumDashboard';

function App() {
  return (
    <QueryClient>
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
                      <LoanApplication />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/loan-approval/:id" 
                  element={
                    <PrivateRoute>
                      <LoanApproval />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/clients" 
                  element={
                    <PrivateRoute>
                      <ClientManagement />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/client/:id" 
                  element={
                    <PrivateRoute>
                      <ClientDetails />
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
                      <Reports />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <Settings />
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
    </QueryClient>
  );
}

export default App;
