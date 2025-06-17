
/**
 * The official LoanBookLiveRecord interface matches the columns from the Supabase table "loan_book_live".
 * Updated to use actual date-based payment columns and include all risk analytics fields.
 */
export interface LoanBookLiveRecord {
  id: string;
  client_name: string;
  amount_returnable: number;
  // Date-based payment columns (actual database structure)
  "30-05-2025": number;
  "31-05-2025": number;
  "02-06-2025": number;
  "04-06-2025": number;
  "05-06-2025": number;
  "07-06-2025": number;
  "10-06-2025": number;
  "11-06-2025": number;
  "12-06-2025": number;
  "13-06-2025": number;
  "14-06-2025": number;
  "16-06-2025": number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  // Risk analytics columns
  risk_score: number;
  default_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors?: Record<string, any>;
}
