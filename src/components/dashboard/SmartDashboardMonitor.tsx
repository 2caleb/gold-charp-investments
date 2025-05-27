
import React from 'react';
import EnhancedSmartDashboardMonitor from './EnhancedSmartDashboardMonitor';

// This component now just wraps the enhanced version for backward compatibility
const SmartDashboardMonitor = () => {
  return <EnhancedSmartDashboardMonitor />;
};

export default SmartDashboardMonitor;
