
import { WorkflowLoanData } from "@/types/workflow";

/**
 * Adapts legacy loan data format to the new WorkflowLoanData format
 * This helps maintain compatibility with existing code while we transition to the new format
 */
export const adaptLoanDataToWorkflowFormat = (loanData: any): WorkflowLoanData => {
  // Determine the current workflow stage
  const workflow = loanData.loan_application_workflow || {};
  const currentStage = workflow.current_stage || 'field_officer';
  
  return {
    ...loanData,
    loan_amount: typeof loanData.loan_amount === 'string' ? parseFloat(loanData.loan_amount) : loanData.loan_amount,
    workflow_stage: currentStage,
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
  if (loanData.loan_application_workflow?.current_stage) {
    return loanData.loan_application_workflow.current_stage;
  }
  return loanData.workflow_stage || loanData.current_stage || 'field_officer';
};

/**
 * Check if the current user role can approve the loan at its current stage
 */
export const canUserApproveCurrentStage = (userRole: string | null, currentStage: string): boolean => {
  if (!userRole || !currentStage) return false;
  
  switch(currentStage) {
    case 'field_officer': return userRole === 'field_officer';
    case 'manager': return userRole === 'manager';
    case 'director': return userRole === 'director';
    case 'chairperson': return userRole === 'chairperson';
    case 'ceo': return userRole === 'ceo';
    default: return false;
  }
};

/**
 * Get the next workflow stage based on current stage
 */
export const getNextWorkflowStage = (currentStage: string): string | null => {
  const stages = ['field_officer', 'manager', 'director', 'chairperson', 'ceo'];
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null; // Either invalid stage or already at final stage
  }
  
  return stages[currentIndex + 1];
};
