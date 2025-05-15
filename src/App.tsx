
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NewLoanApplication from '@/pages/NewLoanApplication';
import LoanApplicationsList from '@/pages/LoanApplicationsList';
import LoanApprovalPage from '@/pages/LoanApprovalPage';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/Dashboard';
import Notifications from '@/pages/Notifications';
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import Loans from '@/pages/Loans';
import Calculator from '@/pages/Calculator';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import DataCollection from '@/pages/staff/DataCollection';
import NewClient from '@/pages/NewClient';
import ClientsList from '@/pages/ClientsList';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Dashboard routes - accessible to all authenticated users now */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* All staff routes accessible to all authenticated users */}
        <Route path="/staff/data-collection" element={
          <PrivateRoute>
            <DataCollection />
          </PrivateRoute>
        } />
        
        {/* Client management routes */}
        <Route path="/clients" element={
          <PrivateRoute>
            <ClientsList />
          </PrivateRoute>
        } />
        <Route path="/clients/new" element={
          <PrivateRoute>
            <NewClient />
          </PrivateRoute>
        } />
        
        {/* Loan application routes */}
        <Route path="/loan-applications" element={
          <PrivateRoute>
            <LoanApplicationsList />
          </PrivateRoute>
        } />
        <Route path="/loan-applications/new" element={
          <PrivateRoute>
            <NewLoanApplication />
          </PrivateRoute>
        } />
        <Route path="/loan-applications/:id" element={
          <PrivateRoute>
            <LoanApprovalPage />
          </PrivateRoute>
        } />
        
        {/* Notification route */}
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
