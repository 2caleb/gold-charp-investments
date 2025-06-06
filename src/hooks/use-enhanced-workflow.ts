
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { WorkflowStage } from '@/components/workflow/types';

interface WorkflowActionParams {
  applicationId: string;
  action: 'approve' | 'reject';
  notes: string;
  userRole: string;
}

export const useEnhancedWorkflow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced workflow action mutation
  const workflowMutation = useMutation({
    mutationFn: async ({ applicationId, action, notes, userRole }: WorkflowActionParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsProcessing(true);
      console.log('Processing workflow action:', { applicationId, action, notes, userRole });

      try {
        // Call the Supabase edge function for loan approval
        const { data, error } = await supabase.functions.invoke('loan-approval', {
          body: {
            loan_id: applicationId,
            action,
            notes,
            approver_id: user.id
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          // Provide more specific error messages
          if (error.message.includes('404')) {
            throw new Error('Application not found. Please refresh and try again.');
          } else if (error.message.includes('500')) {
            throw new Error('Server error occurred. Please try again in a moment.');
          } else if (error.message.includes('Invalid stage')) {
            throw new Error('Cannot process action at current workflow stage.');
          } else {
            throw new Error(error.message || 'Failed to process workflow action');
          }
        }

        if (!data) {
          throw new Error('No response data received from server');
        }

        if (!data.success) {
          throw new Error(data.error || 'Workflow action failed');
        }

        console.log('Workflow action successful:', data);
        return data;
      } catch (error: any) {
        console.error('Workflow action failed:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      setIsProcessing(false);
      
      const { action, applicationId } = variables;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['loan-application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['loan-workflow', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
      
      // Show success notification
      toast({
        title: `Application ${action}d Successfully`,
        description: data.isFinalDecision 
          ? `Final decision: Application ${action}d by CEO`
          : `Application has been ${action}d and moved to the next stage`,
        variant: action === 'approve' ? 'default' : 'destructive'
      });

      // Show special notification for final decisions
      if (data.isFinalDecision && data.finalResult) {
        setTimeout(() => {
          toast({
            title: data.finalResult === 'SUCCESSFUL' ? '🎉 Application Approved!' : '❌ Application Rejected',
            description: data.finalResult === 'SUCCESSFUL' 
              ? 'The loan application has been fully approved and can now be disbursed.'
              : 'The loan application has been rejected by the CEO.',
            variant: data.finalResult === 'SUCCESSFUL' ? 'default' : 'destructive'
          });
        }, 1000);
      }
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error('Workflow action error:', error);
      
      // Show more specific error messages
      let errorMessage = 'Failed to process the application action';
      let errorTitle = 'Action Failed';
      
      if (error.message.includes('not authenticated')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Please log in to perform this action';
      } else if (error.message.includes('not found')) {
        errorTitle = 'Application Not Found';
        errorMessage = 'The application could not be found. Please refresh the page.';
      } else if (error.message.includes('Server error')) {
        errorTitle = 'Server Error';
        errorMessage = 'A server error occurred. Please try again in a moment.';
      } else if (error.message.includes('workflow stage')) {
        errorTitle = 'Invalid Action';
        errorMessage = 'This action cannot be performed at the current workflow stage.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  // Function to ensure workflow exists for an application
  const ensureWorkflowExists = async (applicationId: string): Promise<WorkflowStage> => {
    try {
      console.log('Checking if workflow exists for application:', applicationId);
      
      const { data: existingWorkflow } = await supabase
        .from('loan_applications_workflow')
        .select('*')
        .eq('loan_application_id', applicationId)
        .maybeSingle();

      if (existingWorkflow) {
        console.log('Workflow already exists:', existingWorkflow.id);
        return existingWorkflow as WorkflowStage;
      }

      // Create new workflow
      console.log('Creating new workflow for application:', applicationId);
      const { data: newWorkflow, error } = await supabase
        .from('loan_applications_workflow')
        .insert({
          loan_application_id: applicationId,
          current_stage: 'manager',
          field_officer_approved: true,
          manager_approved: null,
          director_approved: null,
          chairperson_approved: null,
          ceo_approved: null,
          field_officer_notes: 'Application submitted by field officer',
          manager_notes: null,
          director_notes: null,
          chairperson_notes: null,
          ceo_notes: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow:', error);
        throw new Error(`Failed to create workflow: ${error.message}`);
      }

      console.log('Successfully created workflow:', newWorkflow);
      return newWorkflow as WorkflowStage;
    } catch (error: any) {
      console.error('Error ensuring workflow exists:', error);
      throw error;
    }
  };

  // Function to check if user can take action on current stage
  const canTakeAction = (workflow: any, userRole: string): boolean => {
    if (!workflow || !userRole) return false;
    
    const stageRoleMap = {
      'manager': workflow.current_stage === 'manager',
      'director': workflow.current_stage === 'director',
      'chairperson': workflow.current_stage === 'chairperson',
      'ceo': workflow.current_stage === 'ceo'
    };

    return stageRoleMap[userRole as keyof typeof stageRoleMap] || false;
  };

  // Function to get workflow stage display name
  const getStageDisplayName = (stage: string): string => {
    const stageNames = {
      'field_officer': 'Field Officer',
      'manager': 'Manager',
      'director': 'Director',
      'chairperson': 'Chairperson',
      'ceo': 'CEO'
    };
    
    return stageNames[stage as keyof typeof stageNames] || stage;
  };

  return {
    processWorkflowAction: workflowMutation.mutate,
    isProcessing: isProcessing || workflowMutation.isPending,
    ensureWorkflowExists,
    canTakeAction,
    getStageDisplayName,
    error: workflowMutation.error
  };
};
