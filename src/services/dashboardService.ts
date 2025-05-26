
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalLoanAmount: number;
  applications: any[];
}

// Loan Performance Chart Data Interface
interface LoanPerformanceData {
  month: string;
  disbursed: number;
  repaid: number;
  defaulted: number;
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

export const fetchLoanPerformanceData = async (): Promise<{ data: LoanPerformanceData[] | null, error: any }> => {
  try {
    const { data: applications, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    // Process applications into monthly performance data
    const monthlyData: { [key: string]: LoanPerformanceData } = {};
    
    applications?.forEach(app => {
      const date = new Date(app.created_at);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          disbursed: 0,
          repaid: 0,
          defaulted: 0
        };
      }
      
      const amount = typeof app.loan_amount === 'string' 
        ? parseFloat(app.loan_amount.replace(/,/g, '')) 
        : app.loan_amount || 0;
      
      if (app.status === 'approved') {
        monthlyData[monthKey].disbursed += amount;
      } else if (app.status === 'repaid') {
        monthlyData[monthKey].repaid += amount;
      } else if (app.status === 'defaulted') {
        monthlyData[monthKey].defaulted += amount;
      }
    });

    const performanceData = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    return { data: performanceData, error: null };
  } catch (error) {
    console.error('Error fetching loan performance data:', error);
    return { data: null, error };
  }
};

export const getMockLoanPerformanceData = (): LoanPerformanceData[] => {
  return [
    { month: 'Jan 2024', disbursed: 15000000, repaid: 12000000, defaulted: 500000 },
    { month: 'Feb 2024', disbursed: 18000000, repaid: 14000000, defaulted: 300000 },
    { month: 'Mar 2024', disbursed: 22000000, repaid: 16000000, defaulted: 800000 },
    { month: 'Apr 2024', disbursed: 20000000, repaid: 18000000, defaulted: 600000 },
    { month: 'May 2024', disbursed: 25000000, repaid: 20000000, defaulted: 400000 },
    { month: 'Jun 2024', disbursed: 28000000, repaid: 22000000, defaulted: 700000 }
  ];
};
