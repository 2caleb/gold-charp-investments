
import React from 'react';
import PremiumNavBar from './PremiumNavBar';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PremiumNavBar />
      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopNav />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default DashboardLayout;
