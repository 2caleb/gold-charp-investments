
import { WorkflowLoanData } from "@/types/workflow";

/**
 * Adapts legacy loan data format to the new WorkflowLoanData format
 * This helps maintain compatibility with existing code while we transition to the new format
 */
export const adaptLoanDataToWorkflowFormat = (loanData: any): WorkflowLoanData => {
  // Determine the current workflow stage from the loan_applications_workflow data - FIXED TABLE NAME
  const workflow = loanData.loan_applications_workflow || loanData.loan_application_workflow || {};
  const currentStage = workflow.current_stage || getStageFromStatus(loanData.status) || 'field_officer';
  
  // Handle phone number mapping - check multiple possible field names
  const phoneNumber = loanData.phone || loanData.phone_number || '';
  
  return {
    ...loanData,
    loan_amount: typeof loanData.loan_amount === 'string' ? parseFloat(loanData.loan_amount) : loanData.loan_amount,
    workflow_stage: currentStage,
    // Map between purpose and purpose_of_loan fields
    purpose: loanData.purpose || loanData.purpose_of_loan || '',
    purpose_of_loan: loanData.purpose_of_loan || loanData.purpose || '',
    // Ensure phone number is properly mapped
    phone: phoneNumber,
    phone_number: phoneNumber,
    // Ensure all required fields are present
    client_id: loanData.client_id || '',
    client_name: loanData.client_name || '',
    loan_term: loanData.loan_term || '',
    interest_rate: loanData.interest_rate || '',
    address: loanData.address || '',
    id_number: loanData.id_number || '',
    employment_status: loanData.employment_status || '',
    approval_notes: loanData.approval_notes || '',
    created_by: loanData.created_by || '',
    created_at: loanData.created_at || new Date().toISOString(),
    current_approver: loanData.current_approver || '',
    status: loanData.status || 'pending',
    loan_type: loanData.loan_type || 'general',
    loan_application_workflow: workflow
  };
};

/**
 * Determine workflow stage from application status
 */
const getStageFromStatus = (status: string): string => {
  switch (status) {
    case 'submitted':
    case 'pending_field_officer':
      return 'field_officer';
    case 'pending_manager':
      return 'manager';
    case 'pending_director':
      return 'director';
    case 'pending_chairperson':
      return 'chairperson';
    case 'pending_ceo':
      return 'ceo';
    case 'approved':
    case 'rejected':
      return 'completed';
    default:
      return 'field_officer';
  }
};

/**
 * Access the workflow stage property regardless of which property name is used
 */
export const getWorkflowStage = (loanData: any): string => {
  if (loanData.loan_applications_workflow?.current_stage) {
    return loanData.loan_applications_workflow.current_stage;
  }
  if (loanData.loan_application_workflow?.current_stage) {
    return loanData.loan_application_workflow.current_stage;
  }
  return loanData.workflow_stage || loanData.current_stage || getStageFromStatus(loanData.status) || 'field_officer';
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
 * Get the next workflow stage based on current stage - UPDATED SEQUENCE
 */
export const getNextWorkflowStage = (currentStage: string): string | null => {
  const stages = ['field_officer', 'manager', 'director', 'chairperson', 'ceo'];
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null; // Either invalid stage or already at final stage
  }
  
  return stages[currentIndex + 1];
};
