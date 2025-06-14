
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLiveLoanPerformance } from '@/hooks/use-live-loan-performance';
import { TrendingUp } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Import the smaller components
import LiveStatusHeader from './loan-performance/LiveStatusHeader';
import SummaryCards from './loan-performance/SummaryCards';
import LoanCard from './loan-performance/LoanCard';
import LoadingState from './loan-performance/LoadingState';
import ErrorState from './loan-performance/ErrorState';
import EmptyState from './loan-performance/EmptyState';

interface EnhancedLiveLoanPerformanceProps {
  clientName: string;
}

const EnhancedLiveLoanPerformance: React.FC<EnhancedLiveLoanPerformanceProps> = ({ clientName }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  
  const { data: loanData, isLoading, error } = useLiveLoanPerformance(clientName);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState clientName={clientName} />;
  }

  if (!loanData || loanData.length === 0) {
    return <EmptyState clientName={clientName} />;
  }

  // Smart filtering: separate active and completed loans
  const activeLoans = loanData.filter(loan => !loan.isCompleted);
  const completedLoans = loanData.filter(loan => loan.isCompleted);
  const displayLoans = showCompleted ? loanData : activeLoans;

  // Calculate summary statistics for active loans only
  const activeLoanStats = activeLoans.reduce((stats, loan) => ({
    totalLoaned: stats.totalLoaned + loan.amount_returnable,
    totalPaid: stats.totalPaid + loan.totalPaid,
    totalRemaining: stats.totalRemaining + (loan.remaining_balance || 0)
  }), { totalLoaned: 0, totalPaid: 0, totalRemaining: 0 });

  const averageProgress = activeLoans.length > 0 ? 
    activeLoans.reduce((sum, loan) => sum + loan.progress, 0) / activeLoans.length : 0;

  return (
    <div className="space-y-6">
      {/* Live Status Header */}
      <LiveStatusHeader
        recentlyUpdated={loanData.some(loan => loan.recentlyUpdated)}
        completedCount={completedLoans.length}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted(!showCompleted)}
      />

      {/* Summary Cards - Only for active loans */}
      {activeLoans.length > 0 && (
        <SummaryCards
          totalLoaned={activeLoanStats.totalLoaned}
          totalPaid={activeLoanStats.totalPaid}
          totalRemaining={activeLoanStats.totalRemaining}
          averageProgress={averageProgress}
        />
      )}

      {/* Detailed Loan Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Loan Details ({displayLoans.length} loans)
            </span>
            {activeLoans.length !== loanData.length && (
              <Badge variant="secondary">
                {completedLoans.length} completed loans
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <div className="space-y-4">
              {displayLoans.map((loan) => (
                <LoanCard
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
