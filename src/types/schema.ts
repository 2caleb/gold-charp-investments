// Custom type definitions to work with our database schema

export interface Client {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  id_number: string;
  address: string;
  employment_status: string;
  monthly_income: number;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  deleted_at?: string; // Added this field to fix TypeScript errors
}

export interface Loan {
  id: string;
  application_id: string;
  client_id: string;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  start_date: string;
  end_date: string;
  payment_frequency: string; 
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface LoanApplication {
  id: string;
  client_id: string;
  loan_type: string;
  loan_amount: string;
  purpose_of_loan: string;
  application_date: string;
  status: string;
  rejection_reason?: string;
  approval_date?: string;
  approved_by?: string;
  notes?: string;
  created_by: string;
  current_approver?: string;
}

export interface Repayment {
  id: string;
  loan_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  transaction_reference?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Collateral {
  id: string;
  loan_id: string;
  type: string;
  description: string;
  value: number;
  document_urls: string[];
  status: string;
  created_at: string;
  updated_at?: string;
}
