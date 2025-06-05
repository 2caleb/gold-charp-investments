
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useEnhancedWorkflow } from '@/hooks/use-enhanced-workflow';
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
  const [notes, setNotes] = useState('');
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [finalResult, setFinalResult] = useState<'SUCCESSFUL' | 'FAILED' | null>(null);
  
  const { 
    processWorkflowAction, 
    isProcessing, 
    ensureWorkflowExists, 
    canTakeAction,
    getStageDisplayName 
  } = useEnhancedWorkflow();

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

  const handleApprove = () => {
    if (!userRole || !workflow) {
      toast({
        title: 'Error',
        description: 'Missing required data for workflow action',
        variant: 'destructive'
      });
      return;
    }

    console.log('Approving application with notes:', notes);
    processWorkflowAction({
      applicationId,
      action: 'approve',
      notes,
      userRole
    });
  };

  const handleReject = () => {
    if (!userRole || !workflow) {
      toast({
        title: 'Error',
        description: 'Missing required data for workflow action',
        variant: 'destructive'
      });
      return;
    }

    console.log('Rejecting application with notes:', notes);
    processWorkflowAction({
      applicationId,
      action: 'reject',
      notes,
      userRole
    });
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

  const userCanTakeAction = canTakeAction(workflow, userRole);

  return (
    <div className="space-y-6">
      <FinalResultAnimation 
        showFinalResult={showFinalResult}
        finalResult={finalResult}
      />

      <ApplicationDetailsCard application={application} />

      <WorkflowStagesCard workflow={workflow} application={application} />

      {userCanTakeAction && (
        <WorkflowActionCard
          userRole={userRole}
          notes={notes}
          setNotes={setNotes}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {!userCanTakeAction && userRole && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-600">
              <p>You don't have permission to take action on this application at its current stage.</p>
              <p className="mt-2">Current stage: <span className="font-semibold">{getStageDisplayName(workflow.current_stage)}</span></p>
              <p>Your role: <span className="font-semibold capitalize">{userRole}</span></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLoanApprovalWorkflow;
