
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import StaffRoutes from './StaffRoutes';
import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <PublicRoutes />
        <ProtectedRoutes />
        <StaffRoutes />
        
        {/* Catch all route */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
