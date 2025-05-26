
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalLoanAmount: number;
  applications: any[];
}

export const fetchDashboardData = async (userId: string): Promise<DashboardData> => {
  console.log('Fetching dashboard data for authenticated user:', userId);

  try {
    // Fetch loan applications with workflow data
    const { data: applications, error: applicationsError } = await supabase
      .from('loan_applications')
      .select(`
        *,
        loan_appliations_workflow!loan_appliations_workflow_loan_application_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      throw applicationsError;
    }

    console.log('Applications fetched:', applications?.length || 0);

    const totalApplications = applications?.length || 0;
    const pendingApplications = applications?.filter(app => 
      app.status.includes('pending') || app.status === 'submitted'
    ).length || 0;
    const approvedApplications = applications?.filter(app => 
      app.status === 'approved'
    ).length || 0;
    const rejectedApplications = applications?.filter(app => 
      app.status.includes('rejected')
    ).length || 0;

    const totalLoanAmount = applications?.reduce((sum, app) => {
      const amount = typeof app.loan_amount === 'string' 
        ? parseFloat(app.loan_amount.replace(/,/g, '')) 
        : app.loan_amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0) || 0;

    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalLoanAmount,
      applications: applications || []
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw error;
  }
};

export const fetchWorkflowData = async (loanApplicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_appliations_workflow')
      .select('*')
      .eq('loan_application_id', loanApplicationId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Workflow data fetch error:', error);
    return null;
  }
};
