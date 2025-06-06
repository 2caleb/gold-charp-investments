
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import DatabaseEditingGuide from '@/components/financial/DatabaseEditingGuide';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';

const Dashboard = () => {
  const [showDatabaseGuide, setShowDatabaseGuide] = useState(false);

  if (showDatabaseGuide) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseGuide(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <DatabaseEditingGuide />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Premium Welcome Section as Main Content */}
        <PremiumWelcomeSection />

        {/* Database editing functionality - positioned elegantly below */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseGuide(true)}
            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <Database className="h-4 w-4" />
            Edit Financial Data
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
