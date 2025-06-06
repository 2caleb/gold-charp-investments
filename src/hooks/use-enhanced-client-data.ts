
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedClient, LoanApplicationSummary } from '@/types/client';

export const useEnhancedClientData = () => {
  return useQuery({
    queryKey: ['enhanced-clients-data'],
    queryFn: async () => {
      console.log('Fetching enhanced client data with loan applications...');
      
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

      // Fetch loan applications for all clients
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
          id_number
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

      // Enhance clients with loan application data
      const enhancedClients: EnhancedClient[] = clients.map(client => {
        // Find applications for this client by matching name, phone, or ID
        const clientApplications = applications?.filter(app => 
          app.client_name === client.full_name ||
          app.phone_number === client.phone_number ||
          app.id_number === client.id_number
        ) || [];

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

        // Calculate summary statistics
        const totalApplications = applicationsWithWorkflow.length;
        const activeApplications = applicationsWithWorkflow.filter(app => 
          ['submitted', 'pending_manager', 'pending_director', 'pending_ceo', 'pending_chairperson'].includes(app.status)
        ).length;
        const approvedLoans = applicationsWithWorkflow.filter(app => 
          app.status === 'approved' || app.status === 'disbursed'
        ).length;
        const totalLoanAmount = applicationsWithWorkflow.reduce((sum, app) => {
          const amount = parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0;
          return sum + amount;
        }, 0);

        return {
          ...client,
          loan_applications: applicationsWithWorkflow,
          total_applications: totalApplications,
          active_applications: activeApplications,
          approved_loans: approvedLoans,
          total_loan_amount: totalLoanAmount
        };
      });

      console.log(`Enhanced ${enhancedClients.length} clients with loan application data`);
      return enhancedClients;
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
