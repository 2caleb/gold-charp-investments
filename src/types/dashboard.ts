
export interface DashboardMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalLoanAmount: number;
  averageLoanAmount: number;
  recentApplications: any[];
  workflowStats: {
    manager: number;
    director: number;
    chairperson: number;
    ceo: number;
  };
}

export interface LoanApplicationWithWorkflow {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
  id_number: string;
  phone_number: string;
  monthly_income: number;
  employment_status: string;
  address: string;
  purpose_of_loan: string;
  current_approver: string;
  loan_applications_workflow?: Array<{
    current_stage: string;
    field_officer_approved: boolean | null;
    manager_approved: boolean | null;
    director_approved: boolean | null;
    chairperson_approved: boolean | null;
    ceo_approved: boolean | null;
  }>;
}
