
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Premium Welcome Section as Main Content */}
        <PremiumWelcomeSection />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
