
import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Dashboard from '@/pages/Dashboard';
import LoanApplicationsList from '@/pages/LoanApplicationsList';
import NewLoanApplication from '@/pages/NewLoanApplication';
import LoanApprovalPage from '@/pages/LoanApprovalPage';
import ClientsList from '@/pages/ClientsList';
import ClientDetail from '@/pages/ClientDetail';
import NewClient from '@/pages/NewClient';
import Payments from '@/pages/Payments';
import ReportsPage from '@/pages/ReportsPage';

const ProtectedRoutes = () => {
  return (
    <>
      {/* Dashboard Routes */}
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
      
      {/* Loan Application Routes */}
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
      
      {/* Client Management Routes */}
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
      
      {/* Financial Routes */}
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
    </>
  );
};

export default ProtectedRoutes;
