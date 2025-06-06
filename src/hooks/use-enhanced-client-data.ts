
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedClient, LoanApplicationSummary } from '@/types/client';
import { 
  matchClientToApplications, 
  calculateClientStatistics,
  getApplicationStatusCategory 
} from '@/utils/clientDataMatching';

export const useEnhancedClientData = () => {
  return useQuery({
    queryKey: ['enhanced-clients-data'],
    queryFn: async () => {
      console.log('Fetching enhanced client data with sophisticated matching...');
      
      // Fetch clients from the correct table
      const { data: clients, error: clientError } = await supabase
        .from('client_name')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientError) {
        console.error('Error fetching clients:', clientError);
        throw new Error(`Failed to fetch clients: ${clientError.message}`);
      }

      if (!clients || clients.length === 0) {
        console.log('No clients found');
        return [];
      }

      // Fetch ALL loan applications (we'll do sophisticated matching)
      const { data: applications, error: appError } = await supabase
        .from('loan_applications')
        .select(`
          id,
          client_name,
          loan_amount,
          loan_type,
          status,
          created_at,
          phone_number,
          id_number,
          purpose_of_loan,
          employment_status,
          monthly_income
        `)
        .order('created_at', { ascending: false });

      if (appError) {
        console.error('Error fetching loan applications:', appError);
        // Don't throw error, just log it and continue without applications
      }

      // Fetch workflow data for applications
      const { data: workflows, error: workflowError } = await supabase
        .from('loan_applications_workflow')
        .select('*');

      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
      }

      console.log(`Processing ${clients.length} clients and ${applications?.length || 0} applications`);

      // Enhanced clients with sophisticated matching
      const enhancedClients: EnhancedClient[] = clients.map(client => {
        console.log(`Processing client: ${client.full_name}`);
        
        // Use sophisticated matching to find applications for this client
        const clientApplications = applications ? 
          matchClientToApplications(client, applications) : [];

        console.log(`Found ${clientApplications.length} matching applications for ${client.full_name}`);

        // Add workflow status to applications
        const applicationsWithWorkflow: LoanApplicationSummary[] = clientApplications.map(app => {
          const workflow = workflows?.find(w => w.loan_application_id === app.id);
          
          return {
            id: app.id,
            loan_amount: app.loan_amount,
            loan_type: app.loan_type,
            status: app.status,
            created_at: app.created_at,
            current_stage: workflow?.current_stage,
            workflow_status: workflow ? {
              current_stage: workflow.current_stage,
              field_officer_approved: workflow.field_officer_approved || false,
              manager_approved: workflow.manager_approved || false,
              director_approved: workflow.director_approved || false,
              chairperson_approved: workflow.chairperson_approved || false,
              ceo_approved: workflow.ceo_approved || false,
            } : undefined
          };
        });

        // Calculate accurate statistics using the new utility functions
        const statistics = calculateClientStatistics(applicationsWithWorkflow);

        console.log(`Client ${client.full_name} statistics:`, {
          total: statistics.totalApplications,
          active: statistics.activeApplications,
          approved: statistics.approvedLoans,
          amount: statistics.totalLoanAmount
        });

        return {
          ...client,
          loan_applications: applicationsWithWorkflow,
          total_applications: statistics.totalApplications,
          active_applications: statistics.activeApplications,
          approved_loans: statistics.approvedLoans,
          total_loan_amount: statistics.totalLoanAmount
        };
      });

      // Log summary statistics
      const totalClients = enhancedClients.length;
      const clientsWithApps = enhancedClients.filter(c => (c.total_applications || 0) > 0).length;
      const totalActiveApps = enhancedClients.reduce((sum, c) => sum + (c.active_applications || 0), 0);
      const totalApprovedLoans = enhancedClients.reduce((sum, c) => sum + (c.approved_loans || 0), 0);

      console.log('Enhanced client data summary:', {
        totalClients,
        clientsWithApps,
        totalActiveApps,
        totalApprovedLoans,
        matchingSuccessRate: clientsWithApps > 0 ? ((clientsWithApps / totalClients) * 100).toFixed(1) + '%' : '0%'
      });

      return enhancedClients;
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
