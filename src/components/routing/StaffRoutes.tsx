
import React from 'react';
import { Route } from 'react-router-dom';
import StaffRoute from '@/components/auth/StaffRoute';
import DataCollectionDashboard from '@/pages/staff/DataCollectionDashboard';

const StaffRoutes = () => {
  return (
    <>
      <Route 
        path="/staff/data-collection" 
        element={
          <StaffRoute>
            <DataCollectionDashboard />
          </StaffRoute>
        } 
      />
    </>
  );
};

export default StaffRoutes;
