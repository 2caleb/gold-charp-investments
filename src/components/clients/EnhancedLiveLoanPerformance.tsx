
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLiveLoanPerformance } from '@/hooks/use-live-loan-performance';
import { useSmartLoanCalculations } from '@/hooks/use-smart-loan-calculations';
import { TrendingUp } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Import the enhanced smart components
import LiveStatusHeader from './loan-performance/LiveStatusHeader';
import SmartSummaryCards from './loan-performance/SmartSummaryCards';
import EnhancedLoanCard from './loan-performance/EnhancedLoanCard';
import SmartDataQualityIndicator from './loan-performance/SmartDataQualityIndicator';
import LoadingState from './loan-performance/LoadingState';
import ErrorState from './loan-performance/ErrorState';
import EmptyState from './loan-performance/EmptyState';

interface EnhancedLiveLoanPerformanceProps {
  clientName: string;
}

const EnhancedLiveLoanPerformance: React.FC<EnhancedLiveLoanPerformanceProps> = ({ clientName }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  
  const { data: rawLoanData, isLoading, error } = useLiveLoanPerformance(clientName);
  
  // The loan data is already properly transformed by the hook, so we can use it directly
  const { 
    smartLoanData, 
    portfolioMetrics, 
    hasDataQualityIssues, 
    dataQualityScore 
  } = useSmartLoanCalculations(rawLoanData || []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState clientName={clientName} />;
  }

  if (!smartLoanData || smartLoanData.length === 0) {
    return <EmptyState clientName={clientName} />;
  }

  // Smart filtering: separate active and completed loans using calculated data
  const activeLoans = smartLoanData.filter(loan => !loan.isCompleted);
  const completedLoans = smartLoanData.filter(loan => loan.isCompleted);
  const displayLoans = showCompleted ? smartLoanData : activeLoans;

  return (
    <div className="space-y-6">
      {/* Enhanced Live Status Header */}
      <LiveStatusHeader
        recentlyUpdated={smartLoanData.some(loan => loan.recentlyUpdated)}
        completedCount={completedLoans.length}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted(!showCompleted)}
      />

      {/* Smart Data Quality Monitor */}
      <SmartDataQualityIndicator
        dataQualityScore={dataQualityScore}
        hasIssues={hasDataQualityIssues}
        totalLoans={portfolioMetrics.total_loans}
        reliableLoans={portfolioMetrics.reliable_loans}
        loansNeedingAttention={portfolioMetrics.loans_needing_attention}
      />

      {/* Smart Summary Cards - Using reliable calculations */}
      {activeLoans.length > 0 && (
        <SmartSummaryCards
          reliableTotalLoaned={portfolioMetrics.reliable_total_portfolio}
          reliableTotalPaid={portfolioMetrics.reliable_total_paid}
          reliableTotalRemaining={portfolioMetrics.reliable_total_remaining}
          reliableCollectionRate={portfolioMetrics.reliable_collection_rate}
          totalLoans={portfolioMetrics.total_loans}
          reliableLoans={portfolioMetrics.reliable_loans}
          averageCollectionEfficiency={portfolioMetrics.average_collection_efficiency}
          dataQualityScore={dataQualityScore}
        />
      )}

      {/* Enhanced Detailed Loan Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Smart Loan Analysis ({displayLoans.length} loans)
            </span>
            <div className="flex items-center space-x-2">
              {hasDataQualityIssues && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Auto-Calculating
                </Badge>
              )}
              {activeLoans.length !== smartLoanData.length && (
                <Badge variant="secondary">
                  {completedLoans.length} completed loans
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <div className="space-y-4">
              {displayLoans.map((loan) => (
                <EnhancedLoanCard
                  key={loan.id}
                  loan={loan}
                  expandedLoanId={expandedLoanId}
                  onToggleExpand={(loanId) => setExpandedLoanId(expandedLoanId === loanId ? null : loanId)}
                />
              ))}
            </div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLiveLoanPerformance;
