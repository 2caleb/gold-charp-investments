
export interface WorkflowLoanData {
  id: string;
  client_id: string;
  client_name: string;
  loan_amount: number;
  loan_term: string;
  interest_rate: string;
  address: string;
  id_number: string;
  employment_status: string;
  phone: string;
  phone_number?: string; // Added alternative field name
  purpose: string;
  purpose_of_loan?: string;
  approval_notes: string;
  created_by: string;
  created_at: string;
  current_approver: string;
  workflow_stage: string;
  status: string;
  loan_type?: string;
  loan_application_workflow?: any;
}
