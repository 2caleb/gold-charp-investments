
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useEnhancedWorkflow } from '@/hooks/use-enhanced-workflow';
import ApplicationDetailsCard from './ApplicationDetailsCard';
import WorkflowStagesCard from './WorkflowStagesCard';
import WorkflowActionCard from './WorkflowActionCard';
import FinalResultAnimation from './FinalResultAnimation';
import WorkflowErrorCard from './components/WorkflowErrorCard';
import WorkflowLoadingCard from './components/WorkflowLoadingCard';
import NoPermissionCard from './components/NoPermissionCard';
import { useWorkflowData } from './hooks/useWorkflowData';
import { WorkflowProps } from './types';

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
    canTakeAction,
    getStageDisplayName 
  } = useEnhancedWorkflow();

  const {
    application,
    workflow,
    appLoading,
    workflowLoading,
    appError,
    workflowLoadError,
    refetchWorkflow
  } = useWorkflowData(applicationId);

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
    return <WorkflowLoadingCard />;
  }

  if (appError || !application) {
    return (
      <WorkflowErrorCard 
        error={`Failed to load application details: ${appError?.message || 'Unknown error'}`}
      />
    );
  }

  if (workflowLoadError) {
    return (
      <WorkflowErrorCard 
        error={`Workflow Error: ${workflowLoadError.message}`}
        onRetry={handleRetryWorkflow}
        retryLabel="Retry Loading Workflow"
      />
    );
  }

  if (!workflow) {
    return (
      <WorkflowErrorCard 
        error="Creating workflow for this application..."
        onRetry={handleRetryWorkflow}
        retryLabel="Retry Creating Workflow"
      />
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
        <NoPermissionCard 
          userRole={userRole}
          currentStage={workflow.current_stage}
          getStageDisplayName={getStageDisplayName}
        />
      )}
    </div>
  );
};

export default EnhancedLoanApprovalWorkflow;
