
export interface WorkflowLoanData {
  id: string;
  client_id: string;
  client_name: string;
  loan_amount: number; // Changed from string to number
  loan_term: string;
  interest_rate: string;
  address: string;
  id_number: string;
  employment_status: string;
  phone: string;
  purpose: string;
  purpose_of_loan?: string; // Added this field
  approval_notes: string;
  created_by: string;
  created_at: string;
  current_approver: string;
  workflow_stage: string; // Added this field to replace current_stage
  status: string;
  loan_type?: string; // Added as optional to maintain compatibility
  loan_application_workflow?: any; // Added this property to fix the error
}
