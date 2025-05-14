
// Custom type definitions to work with our database schema

export interface Client {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string | null;
  id_number: string;
  address: string;
  employment_status: string;
  monthly_income: number;
  created_at: string;
  updated_at?: string;
  user_id?: string;
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
