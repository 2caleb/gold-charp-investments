
import React from 'react';
import { Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
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

const PublicRoutes = () => {
  return (
    <>
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
    </>
  );
};

export default PublicRoutes;
