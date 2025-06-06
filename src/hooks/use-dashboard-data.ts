
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardMetrics } from '@/types/dashboard';
import { useLoanApplicationsQuery } from '@/hooks/use-loan-applications-query';
import { useFinancialSummaryQuery } from '@/hooks/use-financial-summary-query';
import { useDashboardRealtime } from '@/hooks/use-dashboard-realtime';
import { calculateDashboardMetrics, getWorkflowStatus } from '@/utils/dashboard-metrics';
import { useToast } from '@/hooks/use-toast';

export const useDashboardData = () => {
  const { toast } = useToast();
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

  // Use the separated query hooks with better error handling
  const { 
    data: applications, 
    isLoading: applicationsLoading, 
    error: applicationsError,
    refetch: refetchApplications
  } = useLoanApplicationsQuery();
  
  const { 
    data: financialSummary, 
    isLoading: financialLoading,
    refetch: refetchFinancial
  } = useFinancialSummaryQuery();
  
  // Set up real-time subscriptions
  useDashboardRealtime();

  // Process dashboard metrics whenever applications data changes
  useEffect(() => {
    if (!applications) return;
    
    try {
      setMetrics(calculateDashboardMetrics(applications));
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
      toast({
        title: "Calculation Error",
        description: "There was an error processing dashboard metrics",
        variant: "destructive"
      });
    }
  }, [applications, toast]);

  // Handle errors with user feedback
  useEffect(() => {
    if (applicationsError) {
      console.error('Applications error:', applicationsError);
      toast({
        title: "Data Loading Error",
        description: "Failed to load loan applications. Please try refreshing.",
        variant: "destructive"
      });
    }
  }, [applicationsError, toast]);

  const refreshData = async () => {
    console.log('Manually refreshing dashboard data');
    
    try {
      await Promise.all([
        refetchApplications(),
        refetchFinancial()
      ]);
      
      // Invalidate all dashboard-related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully"
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive"
      });
    }
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
