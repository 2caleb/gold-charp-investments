
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@/components/auth/PrivateRoute';
import StaffRoute from '@/components/auth/StaffRoute';
import NotFound from '@/pages/NotFound';

// Authentication Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Public Pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import Calculator from '@/pages/Calculator';
import Loans from '@/pages/Loans';
import MortgageLoansPage from '@/pages/loans/MortgageLoans';
import RefinanceLoansPage from '@/pages/loans/RefinanceLoans';
import EquityLoansPage from '@/pages/loans/EquityLoans';
import MoneyTransfer from '@/pages/MoneyTransfer';
import PropertyEvaluation from '@/pages/PropertyEvaluation';
import ServicesPage from '@/pages/services/index';
import Insurance from '@/pages/services/Insurance';
import FastTrack from '@/pages/services/FastTrack';
import BusinessSupport from '@/pages/services/BusinessSupport';

// Protected Pages
import Dashboard from '@/pages/Dashboard';
import LoanApplicationsList from '@/pages/LoanApplicationsList';
import NewLoanApplication from '@/pages/NewLoanApplication';
import LoanApprovalPage from '@/pages/LoanApprovalPage';
import ClientsList from '@/pages/ClientsList';
import ClientDetail from '@/pages/ClientDetail';
import NewClient from '@/pages/NewClient';
import Payments from '@/pages/Payments';
import ReportsPage from '@/pages/ReportsPage';

// Staff Pages
import DataCollectionDashboard from '@/pages/staff/DataCollectionDashboard';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Public Pages */}
        <Route path="/home" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/loans/mortgage" element={<MortgageLoansPage />} />
        <Route path="/loans/refinance" element={<RefinanceLoansPage />} />
        <Route path="/loans/equity" element={<EquityLoansPage />} />
        <Route path="/money-transfer" element={<MoneyTransfer />} />
        <Route path="/property-evaluation" element={<PropertyEvaluation />} />
        
        {/* Services Routes */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/insurance" element={<Insurance />} />
        <Route path="/services/fast-track" element={<FastTrack />} />
        <Route path="/services/business-support" element={<BusinessSupport />} />
        <Route path="/services/mortgage" element={<Loans />} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Protected Loan Application Routes */}
        <Route 
          path="/loan-applications" 
          element={
            <PrivateRoute>
              <LoanApplicationsList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/loan-applications/new" 
          element={
            <PrivateRoute>
              <NewLoanApplication />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/loan-applications/:id" 
          element={
            <PrivateRoute>
              <LoanApprovalPage />
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
        
        {/* Protected Client Management Routes */}
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
        
        {/* Protected Financial Routes */}
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
  );
};

export default AppRoutes;
