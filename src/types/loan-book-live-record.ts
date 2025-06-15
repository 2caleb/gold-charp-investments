
/**
 * The official LoanBookLiveRecord interface matches the columns from the Supabase table "loan_book_live".
 * ALL 12 payment columns are included and precisely named as per your schema.
 * Fields not in the DB must NOT be added here.
 */
export interface LoanBookLiveRecord {
  id: string;
  client_name: string;
  amount_returnable: number;
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  amount_paid_4: number;
  amount_paid_5: number;
  Amount_paid_6: number;
  Amount_paid_7: number;
  Amount_Paid_8: number;
  Amount_Paid_9: number;
  Amount_Paid_10: number;
  Amount_Paid_11: number;
  Amount_Paid_12: number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  // New risk analytics columns
  risk_score: number;
  default_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors?: Record<string, any>;
}
