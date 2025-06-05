
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardMetrics } from '@/types/dashboard';
import { useLoanApplicationsQuery } from '@/hooks/use-loan-applications-query';
import { useFinancialSummaryQuery } from '@/hooks/use-financial-summary-query';
import { useDashboardRealtime } from '@/hooks/use-dashboard-realtime';
import { calculateDashboardMetrics, getWorkflowStatus } from '@/utils/dashboard-metrics';

export const useDashboardData = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalLoanAmount: 0,
    averageLoanAmount: 0,
    recentApplications: [],
    workflowStats: {
      manager: 0,
      director: 0,
      chairperson: 0,
      ceo: 0
    }
  });

  // Use the separated query hooks
  const { data: applications, isLoading: applicationsLoading, error: applicationsError } = useLoanApplicationsQuery();
  const { data: financialSummary, isLoading: financialLoading } = useFinancialSummaryQuery();
  
  // Set up real-time subscriptions
  useDashboardRealtime();

  // Process dashboard metrics whenever applications data changes
  useEffect(() => {
    if (!applications) return;
    setMetrics(calculateDashboardMetrics(applications));
  }, [applications]);

  const refreshData = () => {
    console.log('Manually refreshing dashboard data');
    queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
    queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
  };

  return {
    metrics,
    applications: applications || [],
    financialSummary,
    isLoading: applicationsLoading || financialLoading,
    error: applicationsError,
    refreshData,
    getWorkflowStatus
  };
};
