
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnimatedWorkflowStatus from './AnimatedWorkflowStatus';
import { CheckCircle, XCircle } from 'lucide-react';
import { WorkflowLoanData } from '@/types/workflow';

interface EnhancedLoanApprovalWorkflowProps {
  loanData: WorkflowLoanData;
  onWorkflowUpdate?: () => void;
}

const EnhancedLoanApprovalWorkflow: React.FC<EnhancedLoanApprovalWorkflowProps> = ({ 
  loanData, 
  onWorkflowUpdate 
}) => {
  const { userProfile } = useUser();
  const { userRole, canModifyLoanApplication } = useRolePermissions();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const currentStage = loanData.workflow_stage || 'field_officer';
  const canModify = canModifyLoanApplication(currentStage);

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-workflow-system', {
        body: {
          action: 'process_workflow',
          loan_id: loanData.id,
          approver_id: userProfile.id,
          decision,
          notes
        }
      });

      if (error) throw error;

      toast({
        title: decision === 'approve' ? 'Application Approved' : 'Application Rejected',
        description: `You have successfully ${decision}d this loan application.`,
      });

      // Show animation for final decisions
      if (data.is_final) {
        setShowAnimation(true);
      }

      if (onWorkflowUpdate) {
        onWorkflowUpdate();
      }
    } catch (error: any) {
      console.error('Error processing decision:', error);
      toast({
        title: 'Action Failed',
        description: error.message || 'There was an error processing your request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Animated Workflow Status */}
      <AnimatedWorkflowStatus
        currentStage={currentStage}
        workflowData={loanData.loan_application_workflow}
        status={loanData.status}
        onAnimationComplete={() => setShowAnimation(false)}
      />

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client Name</h3>
              <p className="font-semibold">{loanData.client_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
              <p>{loanData.id_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Loan Amount</h3>
              <p className="font-semibold">UGX {Number(loanData.loan_amount).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
              <p>{loanData.purpose_of_loan || loanData.purpose}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employment Status</h3>
              <p>{loanData.employment_status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p>{loanData.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Panel */}
      {canModify && !['approved', 'rejected', 'rejected_final'].includes(loanData.status) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStage === 'field_officer' && 'Data Entry Verification'}
              {currentStage === 'manager' && 'Manager Review'}
              {currentStage === 'director' && 'Risk Assessment'}
              {currentStage === 'chairperson' && 'Chairperson Approval'}
              {currentStage === 'ceo' && 'CEO Final Decision'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes/Comments
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes or comments here..."
                  className="h-32"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleDecision('reject')}
                  disabled={isSubmitting}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {currentStage === 'ceo' ? 'Final Rejection' : 'Reject'}
                </Button>
                <Button
                  onClick={() => handleDecision('approve')}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {currentStage === 'ceo' ? 'Final Approval' : 'Approve & Forward'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read-only message for unauthorized users */}
      {!canModify && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-600">
              <p className="text-lg font-medium mb-2">Read-Only Mode</p>
              <p>
                This application is currently at the {currentStage.replace('_', ' ')} stage. 
                You can view the details but cannot make decisions at this stage.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLoanApprovalWorkflow;
