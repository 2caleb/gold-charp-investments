
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PremiumManagementDashboard from '@/components/dashboard/PremiumManagementDashboard';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';

const PremiumDashboard = () => {
  return (
    <RoleBasedRoute>
      <DashboardLayout>
        <PremiumManagementDashboard />
      </DashboardLayout>
    </RoleBasedRoute>
  );
};

export default PremiumDashboard;
