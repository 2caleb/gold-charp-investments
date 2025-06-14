
import React from 'react';
import EnhancedLiveLoanPerformance from './EnhancedLiveLoanPerformance';

interface LiveLoanPerformanceProps {
  clientName: string;
}

// This component now wraps the enhanced version for backward compatibility
const LiveLoanPerformance: React.FC<LiveLoanPerformanceProps> = ({ clientName }) => {
  return <EnhancedLiveLoanPerformance clientName={clientName} />;
};

export default LiveLoanPerformance;
