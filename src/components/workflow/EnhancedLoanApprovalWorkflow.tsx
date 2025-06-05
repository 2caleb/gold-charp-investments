
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationDetailsCard from './ApplicationDetailsCard';
import WorkflowStagesCard from './WorkflowStagesCard';
import WorkflowActionCard from './WorkflowActionCard';
import FinalResultAnimation from './FinalResultAnimation';
import { WorkflowProps, LoanApplication, WorkflowStage } from './types';

const EnhancedLoanApprovalWorkflow: React.FC<WorkflowProps> = ({ applicationId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole } = useRolePermissions();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [finalResult, setFinalResult] = useState<'SUCCESSFUL' | 'FAILED' | null>(null);

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

  // Fetch workflow stages with improved error handling and auto-creation
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
        const { data: newWorkflow, error: createError } = await supabase
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
        
        if (createError) {
          console.error('Workflow creation error:', createError);
          throw new Error(`Failed to create workflow: ${createError.message}`);
        }
        
        console.log('Created new workflow:', newWorkflow);
        return newWorkflow as WorkflowStage;
      }
      return data as WorkflowStage;
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Mutation for workflow actions using Supabase edge function
  const workflowMutation = useMutation({
    mutationFn: async ({ action, notes: actionNotes }: { action: 'approve' | 'reject', notes: string }) => {
      if (!userRole || !workflow) {
        throw new Error('Missing required data for workflow action');
      }

      setIsProcessing(true);
      console.log('Processing workflow action:', { action, notes: actionNotes, userRole, applicationId });
      
      try {
        const { data, error } = await supabase.functions.invoke('loan-approval', {
          body: {
            loan_id: applicationId,
            action,
            notes: actionNotes || notes,
            approver_id: user?.id
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Failed to process workflow action');
        }

        console.log('Workflow action result:', data);
        return data;
      } catch (error: any) {
        console.error('Workflow mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      
      // Show animated result for CEO decisions
      if (data.isFinalDecision && data.finalResult) {
        setFinalResult(data.finalResult);
        setShowFinalResult(true);
        
        // Hide the result after 3 seconds
        setTimeout(() => {
          setShowFinalResult(false);
          setFinalResult(null);
        }, 3000);
      }
      
      toast({
        title: `Application ${data.action}d`,
        description: data.isFinalDecision 
          ? `Final decision: Application ${data.action}d by CEO`
          : `The loan application has been ${data.action}d successfully.`,
        variant: data.action === 'approve' ? 'default' : 'destructive'
      });
      
      queryClient.invalidateQueries({ queryKey: ['loan-application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['loan-workflow', applicationId] });
      setNotes('');
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error('Workflow action error:', error);
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process the application',
        variant: 'destructive'
      });
    }
  });

  const canTakeAction = () => {
    if (!workflow || !userRole) return false;
    
    const stageRoleMap = {
      'manager': workflow.current_stage === 'manager',
      'director': workflow.current_stage === 'director',
      'chairperson': workflow.current_stage === 'chairperson',
      'ceo': workflow.current_stage === 'ceo'
    };

    return stageRoleMap[userRole as keyof typeof stageRoleMap] || false;
  };

  const handleApprove = () => {
    console.log('Approving application with notes:', notes);
    workflowMutation.mutate({ action: 'approve', notes });
  };

  const handleReject = () => {
    console.log('Rejecting application with notes:', notes);
    workflowMutation.mutate({ action: 'reject', notes });
  };

  const handleRetryWorkflow = () => {
    console.log('Retrying workflow creation for application:', applicationId);
    refetchWorkflow();
  };

  if (appLoading || workflowLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading application details...</span>
      </div>
    );
  }

  if (appError || !application) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Failed to load application details: {appError?.message || 'Unknown error'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workflowLoadError) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Workflow Error: {workflowLoadError.message}</span>
          </div>
          <Button 
            onClick={handleRetryWorkflow}
            variant="outline"
          >
            Retry Loading Workflow
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center text-yellow-600 mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Creating workflow for this application...</span>
          </div>
          <Button 
            onClick={handleRetryWorkflow}
            variant="outline"
          >
            Retry Creating Workflow
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FinalResultAnimation 
        showFinalResult={showFinalResult}
        finalResult={finalResult}
      />

      <ApplicationDetailsCard application={application} />

      <WorkflowStagesCard workflow={workflow} application={application} />

      {canTakeAction() && (
        <WorkflowActionCard
          userRole={userRole}
          notes={notes}
          setNotes={setNotes}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {!canTakeAction() && userRole && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-600">
              <p>You don't have permission to take action on this application at its current stage.</p>
              <p className="mt-2">Current stage: <span className="font-semibold capitalize">{workflow.current_stage}</span></p>
              <p>Your role: <span className="font-semibold capitalize">{userRole}</span></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLoanApprovalWorkflow;
