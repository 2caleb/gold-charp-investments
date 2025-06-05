
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedWorkflow } from '@/hooks/use-enhanced-workflow';
import { LoanApplication, WorkflowStage } from '../types';

export const useWorkflowData = (applicationId: string) => {
  const { ensureWorkflowExists } = useEnhancedWorkflow();

  // Fetch loan application details
  const { data: application, isLoading: appLoading, error: appError } = useQuery({
    queryKey: ['loan-application', applicationId],
    queryFn: async () => {
      console.log('Fetching application:', applicationId);
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('id', applicationId)
        .single();
      
      if (error) {
        console.error('Application fetch error:', error);
        throw new Error(`Failed to load application: ${error.message}`);
      }
      return data as LoanApplication;
    },
  });

  // Fetch workflow with auto-creation if missing
  const { data: workflow, isLoading: workflowLoading, error: workflowLoadError, refetch: refetchWorkflow } = useQuery({
    queryKey: ['loan-workflow', applicationId],
    queryFn: async () => {
      console.log('Fetching workflow for:', applicationId);
      const { data, error } = await supabase
        .from('loan_applications_workflow')
        .select('*')
        .eq('loan_application_id', applicationId)
        .maybeSingle();
      
      if (error) {
        console.error('Workflow fetch error:', error);
        throw new Error(`Failed to load workflow: ${error.message}`);
      }
      
      // If no workflow exists, create one
      if (!data) {
        console.log('No workflow found, creating new one');
        return await ensureWorkflowExists(applicationId);
      }
      
      return data as WorkflowStage;
    },
    retry: 2,
    retryDelay: 1000,
  });

  return {
    application,
    workflow,
    appLoading,
    workflowLoading,
    appError,
    workflowLoadError,
    refetchWorkflow
  };
};
