
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWorkflowOperations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWorkflowForApplication = async (applicationId: string) => {
    setIsCreating(true);
    try {
      console.log('Creating workflow for application:', applicationId);
      
      // First check if workflow already exists
      const { data: existing } = await supabase
        .from('loan_applications_workflow')
        .select('id')
        .eq('loan_application_id', applicationId)
        .maybeSingle();
      
      if (existing) {
        console.log('Workflow already exists for application:', applicationId);
        return existing;
      }

      // Create new workflow
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
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['loan-workflow', applicationId] });
      
      toast({
        title: 'Workflow Created',
        description: 'Application workflow has been initialized successfully.',
      });

      return newWorkflow;
    } catch (error: any) {
      console.error('Error in createWorkflowForApplication:', error);
      toast({
        title: 'Failed to Create Workflow',
        description: error.message || 'An error occurred while creating the workflow',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const ensureWorkflowExists = async (applicationId: string) => {
    try {
      const { data: workflow } = await supabase
        .from('loan_applications_workflow')
        .select('*')
        .eq('loan_application_id', applicationId)
        .maybeSingle();

      if (!workflow) {
        return await createWorkflowForApplication(applicationId);
      }

      return workflow;
    } catch (error) {
      console.error('Error ensuring workflow exists:', error);
      throw error;
    }
  };

  return {
    createWorkflowForApplication,
    ensureWorkflowExists,
    isCreating
  };
};
