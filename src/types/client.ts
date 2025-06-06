
export interface EnhancedClient {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  address: string;
  id_number: string;
  employment_status: string;
  monthly_income: number;
  status?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  // Loan application data
  loan_applications?: LoanApplicationSummary[];
  total_applications?: number;
  active_applications?: number;
  approved_loans?: number;
  total_loan_amount?: number;
}

export interface LoanApplicationSummary {
  id: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
  current_stage?: string;
  workflow_status?: {
    current_stage: string;
    field_officer_approved: boolean;
    manager_approved: boolean;
    director_approved: boolean;
    chairperson_approved: boolean;
    ceo_approved: boolean;
  };
}

export interface ClientWithApplications extends EnhancedClient {
  applications: LoanApplicationSummary[];
  applicationCount: number;
  latestApplicationStatus?: string;
}
