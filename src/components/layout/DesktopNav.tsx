
import React from 'react';
import EnhancedNavLinks from './EnhancedNavLinks';

const DesktopNav = () => {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            <EnhancedNavLinks />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopNav;
