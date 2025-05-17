
import { DocumentType } from './document';

export interface LoanApplication {
  id?: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  client_id_number: string;
  client_employment_status: string;
  client_monthly_income: string;
  client_email?: string;
  client_id?: string;
  loan_id?: string;
  loan_type: string;
  loan_amount: string;
  loan_term: string;
  term_unit: 'daily' | 'weekly' | 'monthly';
  purpose_of_loan: string;
  notes?: string;
  approval_notes?: string;
  status?: string;
  rejection_reason?: string;
  created_by: string;
  current_approver: string;
  created_at?: string;
  last_updated?: string;
  guarantor1_name: string;
  guarantor1_phone: string;
  guarantor1_id_number: string;
  guarantor1_consent: boolean;
  guarantor2_name?: string;
  guarantor2_phone?: string;
  guarantor2_id_number?: string;
  guarantor2_consent?: boolean;
  terms_accepted: boolean;
  has_collateral: boolean;
  address: string;
}

export interface Client {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  id_number: string;
  address: string;
  employment_status: string;
  monthly_income: number;
}

export interface LoanDetailsFormProps {
  loanApplication?: LoanApplication;
  isUpdateMode?: boolean;
  onSubmit?: (values: any) => void;
  isSubmitting?: boolean;
  clients?: Client[];
  isLoadingClients?: boolean;
  preselectedClientId?: string;
}
