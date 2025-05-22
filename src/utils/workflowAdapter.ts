
import { WorkflowLoanData } from "@/types/workflow";

/**
 * Adapts legacy loan data format to the new WorkflowLoanData format
 * This helps maintain compatibility with existing code while we transition to the new format
 */
export const adaptLoanDataToWorkflowFormat = (loanData: any): WorkflowLoanData => {
  return {
    ...loanData,
    loan_amount: typeof loanData.loan_amount === 'string' ? parseFloat(loanData.loan_amount) : loanData.loan_amount,
    workflow_stage: loanData.current_stage || loanData.workflow_stage || 'pending',
    // Map between purpose and purpose_of_loan fields
    purpose: loanData.purpose || loanData.purpose_of_loan || '',
    purpose_of_loan: loanData.purpose_of_loan || loanData.purpose || '',
    // Ensure all required fields are present
    client_id: loanData.client_id || '',
    client_name: loanData.client_name || '',
    loan_term: loanData.loan_term || '',
    interest_rate: loanData.interest_rate || '',
    address: loanData.address || '',
    id_number: loanData.id_number || '',
    employment_status: loanData.employment_status || '',
    phone: loanData.phone || '',
    approval_notes: loanData.approval_notes || '',
    created_by: loanData.created_by || '',
    created_at: loanData.created_at || new Date().toISOString(),
    current_approver: loanData.current_approver || '',
    status: loanData.status || 'pending',
    loan_type: loanData.loan_type || 'general' // Default loan_type if not provided
  };
};

/**
 * Access the workflow stage property regardless of which property name is used
 */
export const getWorkflowStage = (loanData: any): string => {
  return loanData.workflow_stage || loanData.current_stage || 'pending';
};
