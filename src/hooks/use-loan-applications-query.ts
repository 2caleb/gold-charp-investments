
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplicationWithWorkflow } from '@/types/dashboard';

export const useLoanApplicationsQuery = () => {
  return useQuery({
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
};
