
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Fixed spacing and layout for the welcome section */}
        <div className="mt-6">
          <PremiumWelcomeSection />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
