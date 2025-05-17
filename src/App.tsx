import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Auth Components
import { AuthContextProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import StaffRoute from '@/components/auth/StaffRoute';

// Public Pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Properties from '@/pages/Properties';
import Calculator from '@/pages/Calculator';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Loans from '@/pages/Loans';

// Service Pages
import ServicesPage from '@/pages/services';
import Insurance from '@/pages/services/Insurance';
import FastTrack from '@/pages/services/FastTrack';
import BusinessSupport from '@/pages/services/BusinessSupport';

// Protected Pages
import Dashboard from '@/pages/Dashboard';
import NewLoanApplication from '@/pages/NewLoanApplication';
import LoanApplicationsList from '@/pages/LoanApplicationsList';
import LoanApprovalPage from '@/pages/LoanApprovalPage';
import Notifications from '@/pages/Notifications';
import ClientsList from '@/pages/ClientsList';
import NewClient from '@/pages/NewClient';
import ClientDetail from '@/pages/ClientDetail';

// Staff Pages
import DataCollection from '@/pages/staff/DataCollection';
import DataCollectionDashboard from '@/pages/staff/DataCollectionDashboard';
import ManagerReviewDashboard from '@/pages/staff/ManagerReviewDashboard';
import DirectorRiskDashboard from '@/pages/staff/DirectorRiskDashboard';
import CEOApprovalDashboard from '@/pages/staff/CEOApprovalDashboard';
import ChairpersonFinalDashboard from '@/pages/staff/ChairpersonFinalDashboard';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/calculator" element={<Calculator />} />
                
                {/* Service Routes */}
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/insurance" element={<Insurance />} />
                <Route path="/services/fast-track" element={<FastTrack />} />
                <Route path="/services/business-support" element={<BusinessSupport />} />
                
                {/* Loan Routes */}
                <Route path="/loans" element={<Loans />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/new-loan-application" element={<PrivateRoute><NewLoanApplication /></PrivateRoute>} />
                <Route path="/loan-applications" element={<PrivateRoute><LoanApplicationsList /></PrivateRoute>} />
                <Route path="/loan-approval/:id" element={<PrivateRoute><LoanApprovalPage /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="/clients" element={<PrivateRoute><ClientsList /></PrivateRoute>} />
                <Route path="/clients/new" element={<PrivateRoute><NewClient /></PrivateRoute>} />
                <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
                
                {/* Staff Routes */}
                <Route path="/staff/data-collection" element={<StaffRoute roles={['data_officer']}><DataCollection /></StaffRoute>} />
                <Route path="/staff/data-collection-dashboard" element={<StaffRoute roles={['data_manager']}><DataCollectionDashboard /></StaffRoute>} />
                <Route path="/staff/manager-review" element={<StaffRoute roles={['manager']}><ManagerReviewDashboard /></StaffRoute>} />
                <Route path="/staff/risk-assessment" element={<StaffRoute roles={['risk_director']}><DirectorRiskDashboard /></StaffRoute>} />
                <Route path="/staff/ceo-approval" element={<StaffRoute roles={['ceo']}><CEOApprovalDashboard /></StaffRoute>} />
                <Route path="/staff/chairperson-final" element={<StaffRoute roles={['chairperson']}><ChairpersonFinalDashboard /></StaffRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationsProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
