import React from 'react';
import { Card } from '@/components/ui/card';
import NoActionRequired from './NoActionRequired';
import { useUser } from '@/hooks/use-user';
import { InstallmentCalculator } from '@/components/loans/calculator';

export interface WorkflowLoanData {
  id: string;
  client_name: string;
  loan_amount: number;
  loan_type: string;
  purpose_of_loan?: string;
  status: string;
  current_stage?: string;
  // ... other loan properties
}

interface LoanApprovalWorkflowProps {
  loanData: WorkflowLoanData;
  onWorkflowUpdate: () => void;
}

const LoanApprovalWorkflow: React.FC<LoanApprovalWorkflowProps> = ({ loanData, onWorkflowUpdate }) => {
  const { userProfile } = useUser();
  
  // Add current_stage if it's missing in the data
  const loanDataWithStage = {
    ...loanData,
    current_stage: loanData.current_stage || loanData.status || 'pending'
  };

  if (!userProfile) {
    return <NoActionRequired message="Please log in to access the loan approval workflow." />;
  }

  // Rest of your component implementation
  // This is just a placeholder implementation to fix the interface issues
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Loan Approval Workflow</h2>
      <p>Current Stage: {loanDataWithStage.current_stage}</p>
      
      {/* Render appropriate content based on user role and loan stage */}
      {userProfile.role !== 'approver' && (
        <NoActionRequired 
          userRole={userProfile.role}
          message="You don't have permission to approve this loan." 
        />
      )}
      
      {/* Show loan repayment details */}
      <InstallmentCalculator
        amount={loanDataWithStage.loan_amount}
        term={12} // Default to 12 months if not specified
        unit="months"
        interestRate={15} // Default interest rate
      />
    </Card>
  );
};

export default LoanApprovalWorkflow;
export type { WorkflowLoanData };
