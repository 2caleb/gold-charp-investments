
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DatabaseEditingGuide from '@/components/financial/DatabaseEditingGuide';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

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
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center space-y-8 p-8">
        {/* Premium Welcome Experience */}
        <div className="w-full max-w-4xl">
          <PremiumWelcomeSection />
        </div>

        {/* Database Editing Access */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseGuide(true)}
            className="flex items-center gap-2 px-6 py-3 text-lg"
            size="lg"
          >
            <Database className="h-5 w-5" />
            Edit Financial Data
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
