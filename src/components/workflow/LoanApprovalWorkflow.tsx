
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import NoActionRequired from './NoActionRequired';
import { useUser } from '@/hooks/use-user';
import { InstallmentCalculator } from '@/components/loans/calculator';
import { WorkflowLoanData } from '@/types/workflow';
import { useRolePermissions } from '@/hooks/use-role-permissions'; 
import { useLoanFunctions } from '@/hooks/use-loan-functions';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoanApprovalWorkflowProps {
  loanData: WorkflowLoanData;
  onWorkflowUpdate?: () => void;
}

const LoanApprovalWorkflow: React.FC<LoanApprovalWorkflowProps> = ({ loanData, onWorkflowUpdate }) => {
  const { userProfile } = useUser();
  const { userRole, canModifyLoanApplication } = useRolePermissions();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleLoanApproval } = useLoanFunctions();
  
  // Add current_stage if it's missing in the data
  const loanDataWithStage = {
    ...loanData,
    current_stage: loanData.workflow_stage || 'pending'
  };

  const currentStage = loanDataWithStage.current_stage;
  const canModify = canModifyLoanApplication(currentStage);

  if (!userProfile) {
    return <NoActionRequired message="Please log in to access the loan approval workflow." />;
  }

  // Safe role type for rejection reason generation
  const safeRoleType = userRole && ['manager', 'director', 'ceo', 'chairperson'].includes(userRole) 
    ? userRole 
    : 'manager';

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    try {
      const result = await handleLoanApproval(
        loanData.id,
        action,
        notes,
        userProfile.id,
        loanData.employment_status,
        String(loanData.loan_amount),
        undefined,
        safeRoleType // Pass the validated role type
      );
      
      if (result) {
        toast({
          title: action === 'approve' ? 'Application Approved' : 'Application Rejected',
          description: `You have successfully ${action === 'approve' ? 'approved' : 'rejected'} this loan application.`,
        });
        
        if (onWorkflowUpdate) {
          onWorkflowUpdate();
        }
      }
    } catch (error) {
      console.error('Error handling loan action:', error);
      toast({
        title: 'Action Failed',
        description: 'There was an error processing your request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role-specific descriptions - Updated for new workflow
  const getRoleDescription = () => {
    switch (currentStage) {
      case 'field_officer':
        return "As a Field Officer, you need to verify client information and complete the initial assessment.";
      case 'manager':
        return "As a Manager, review the application details and verify financial information.";
      case 'director':
        return "As a Director, conduct a thorough risk assessment of this loan application.";
      case 'chairperson':
        return "As the Chairperson, review the board-level risk assessment and provide strategic oversight.";
      case 'ceo':
        return "As the CEO, provide the final approval for this loan application.";
      default:
        return "Review the loan application details below.";
    }
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle className="text-2xl font-semibold">Loan Approval Workflow</CardTitle>
            <CardDescription className="mt-1 flex items-center">
              Current Stage: <span className="ml-1 capitalize">{currentStage.replace('_', ' ')}</span>
            </CardDescription>
          </div>
          <Badge 
            className={
              loanDataWithStage.status === 'approved' ? "bg-green-100 text-green-800" : 
              loanDataWithStage.status === 'rejected' ? "bg-red-100 text-red-800" : 
              "bg-yellow-100 text-yellow-800"
            }
          >
            {loanDataWithStage.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Role-specific instruction */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm">{getRoleDescription()}</p>
        </div>
        
        {/* Client and loan information */}
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
            <h3 className="text-sm font-medium text-gray-500">Loan Type</h3>
            <p>{loanData.loan_type || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Employment Status</h3>
            <p>{loanData.employment_status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
            <p>{loanData.purpose_of_loan || loanData.purpose}</p>
          </div>
        </div>
        
        {/* Loan calculation preview */}
        <div className="mb-8">
          <h3 className="font-medium mb-2">Payment Calculation Preview</h3>
          <InstallmentCalculator
            amount={loanDataWithStage.loan_amount}
            term={12} 
            unit="months"
            interestRate={18}
          />
        </div>
        
        {canModify ? (
          <>
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes for {currentStage === 'approve' ? 'Approval' : 'Decision'}
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
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Application
              </Button>
              <Button
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve and Forward
              </Button>
            </div>
          </>
        ) : (
          <NoActionRequired 
            userRole={userRole}
            message="You don't have permission to approve this loan at its current stage." 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default LoanApprovalWorkflow;
