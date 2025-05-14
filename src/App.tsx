import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthProvider from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import NewLoanApplication from '@/pages/NewLoanApplication';
import LoanApplicationsList from '@/pages/LoanApplicationsList';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import { Toast } from '@/components/ui/toast';
import Dashboard from '@/pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <NewLoanApplication />
            </PrivateRoute>
          } />
          <Route path="/loan-applications" element={
            <PrivateRoute>
              <LoanApplicationsList />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      <Toast />
    </AuthProvider>
  );
}

export default App;
