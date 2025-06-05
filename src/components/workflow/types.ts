
export interface WorkflowProps {
  applicationId: string;
}

export interface LoanApplication {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  purpose_of_loan: string;
  status: string;
  monthly_income: number;
  employment_status: string;
  phone_number: string;
  address: string;
  id_number: string;
  current_approver: string;
  created_at: string;
  approval_notes?: string;
  rejection_reason?: string;
}

export interface WorkflowStage {
  id: string;
  loan_application_id: string;
  current_stage: string;
  field_officer_approved: boolean | null;
  manager_approved: boolean | null;
  director_approved: boolean | null;
  ceo_approved: boolean | null;
  chairperson_approved: boolean | null;
  field_officer_notes: string | null;
  manager_notes: string | null;
  director_notes: boolean | null;
  ceo_notes: boolean | null;
  chairperson_notes: boolean | null;
  created_at: string;
  updated_at: string;
}
