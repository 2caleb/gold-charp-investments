
/**
 * The official LoanBookLiveRecord interface matches ALL columns from the Supabase table "loan_book_live".
 * Updated to include all 26+ date-based payment columns and risk analytics fields.
 */
export interface LoanBookLiveRecord {
  id: string;
  client_name: string;
  amount_returnable: number;
  // All date-based payment columns from the actual database
  "19-05-2025": number;
  "22-05-2025": number;
  "26-05-2025": number;
  "27-05-2025": number;
  "28-05-2025": number;
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
  "17-06-2025": number;
  "18-06-2025": number;
  "19-06-2025": number;
  "20-06-2025": number;
  "23-06-2025": number;
  "24-06-2025": number;
  "25-06-2025": number;
  "26-06-2025": number;
  "27-06-2025": number;
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

/**
 * Utility function to get all date-based payment columns dynamically
 */
export const getPaymentDateColumns = (): string[] => {
  return [
    "19-05-2025", "22-05-2025", "26-05-2025", "27-05-2025", "28-05-2025",
    "30-05-2025", "31-05-2025", "02-06-2025", "04-06-2025", "05-06-2025",
    "07-06-2025", "10-06-2025", "11-06-2025", "12-06-2025", "13-06-2025",
    "14-06-2025", "16-06-2025", "17-06-2025", "18-06-2025", "19-06-2025",
    "20-06-2025", "23-06-2025", "24-06-2025", "25-06-2025", "26-06-2025",
    "27-06-2025"
  ];
};

/**
 * Utility function to get user-friendly date labels
 */
export const getDateLabel = (columnName: string): string => {
  const date = new Date(columnName);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};
