
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalLoanAmount: number;
  averageLoanAmount: number;
  recentApplications: any[];
  workflowStats: {
    manager: number;
    director: number;
    chairperson: number;
    ceo: number;
  };
}

interface LoanApplicationWithWorkflow {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
  current_stage?: string;
  workflow_status?: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
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

  // Fetch all loan applications with workflow data
  const { data: applications, isLoading: applicationsLoading, error: applicationsError } = useQuery({
    queryKey: ['dashboard-applications'],
    queryFn: async () => {
      console.log('Fetching dashboard applications...');
      
      const { data, error } = await supabase
        .from('loan_applications')
        .select(`
          *,
          loan_applications_workflow (
            current_stage,
            field_officer_approved,
            manager_approved,
            director_approved,
            chairperson_approved,
            ceo_approved
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }

      console.log('Fetched applications:', data?.length || 0);
      return data as LoanApplicationWithWorkflow[];
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch financial summary data
  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      console.log('Fetching financial summary...');
      
      const { data, error } = await supabase
        .from('financial_summary')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching financial summary:', error);
      }

      return data;
    },
  });

  // Process dashboard metrics whenever applications data changes
  useEffect(() => {
    if (!applications) return;

    console.log('Processing dashboard metrics for', applications.length, 'applications');

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => 
      app.status.startsWith('pending_') || app.status === 'submitted'
    ).length;
    const approvedApplications = applications.filter(app => 
      app.status === 'approved'
    ).length;
    const rejectedApplications = applications.filter(app => 
      app.status === 'rejected'
    ).length;

    // Calculate loan amounts
    const totalLoanAmount = applications.reduce((sum, app) => {
      const amount = parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const averageLoanAmount = totalApplications > 0 ? totalLoanAmount / totalApplications : 0;

    // Get recent applications (last 10)
    const recentApplications = applications.slice(0, 10).map(app => ({
      ...app,
      current_stage: app.loan_applications_workflow?.[0]?.current_stage || 'submitted',
      workflow_status: getWorkflowStatus(app)
    }));

    // Calculate workflow stage statistics
    const workflowStats = {
      manager: applications.filter(app => 
        app.loan_applications_workflow?.[0]?.current_stage === 'manager'
      ).length,
      director: applications.filter(app => 
        app.loan_applications_workflow?.[0]?.current_stage === 'director'
      ).length,
      chairperson: applications.filter(app => 
        app.loan_applications_workflow?.[0]?.current_stage === 'chairperson'
      ).length,
      ceo: applications.filter(app => 
        app.loan_applications_workflow?.[0]?.current_stage === 'ceo'
      ).length,
    };

    setMetrics({
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalLoanAmount,
      averageLoanAmount,
      recentApplications,
      workflowStats
    });

    console.log('Dashboard metrics calculated:', {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      workflowStats
    });

  }, [applications]);

  // Helper function to determine workflow status
  const getWorkflowStatus = (app: LoanApplicationWithWorkflow): string => {
    const workflow = app.loan_applications_workflow?.[0];
    if (!workflow) return 'No Workflow';

    const { current_stage, field_officer_approved, manager_approved, director_approved, chairperson_approved, ceo_approved } = workflow;

    if (ceo_approved === true) return 'Completed - Approved';
    if (ceo_approved === false) return 'Completed - Rejected';
    
    switch (current_stage) {
      case 'manager':
        return field_officer_approved ? 'Pending Manager Review' : 'Pending Field Officer';
      case 'director':
        return 'Pending Director Review';
      case 'chairperson':
        return 'Pending Chairperson Review';
      case 'ceo':
        return 'Pending CEO Final Decision';
      default:
        return 'In Progress';
    }
  };

  // Real-time subscription for loan applications
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for loan applications');

    const channel = supabase
      .channel('loan-applications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loan_applications'
      }, (payload) => {
        console.log('Real-time update received:', payload);
        
        // Invalidate and refetch the applications data
        queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
        
        // Show notification for new applications
        if (payload.eventType === 'INSERT') {
          toast({
            title: 'New Application Submitted',
            description: `New loan application from ${payload.new.client_name}`,
          });
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loan_applications_workflow'
      }, (payload) => {
        console.log('Workflow update received:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

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
