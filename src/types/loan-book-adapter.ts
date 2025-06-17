
import { LoanBookLiveRecord } from './loan-book-live-record';

// Legacy loan book interface for backward compatibility
export interface LegacyLoanBookRecord {
  id: string;
  client_name: string;
  amount_returnable: number;
  // Legacy numbered payment columns
  amount_paid_1?: number;
  amount_paid_2?: number;
  amount_paid_3?: number;
  amount_paid_4?: number;
  amount_paid_5?: number;
  Amount_paid_6?: number;
  Amount_paid_7?: number;
  Amount_Paid_8?: number;
  Amount_Paid_9?: number;
  Amount_Paid_10?: number;
  Amount_Paid_11?: number;
  Amount_Paid_12?: number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  risk_score: number;
  default_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors?: Record<string, any>;
}

// Type for components that expect legacy schema
export type LoanBookData = LegacyLoanBookRecord;

/**
 * Converts new date-based loan record to legacy numbered format for backward compatibility
 */
export function adaptLoanRecordToLegacy(record: LoanBookLiveRecord): LegacyLoanBookRecord {
  return {
    ...record,
    // Map date-based payments to numbered payments for compatibility
    amount_paid_1: record["30-05-2025"] || 0,
    amount_paid_2: record["31-05-2025"] || 0,
    amount_paid_3: record["02-06-2025"] || 0,
    amount_paid_4: record["04-06-2025"] || 0,
    amount_paid_5: record["05-06-2025"] || 0,
    Amount_paid_6: record["07-06-2025"] || 0,
    Amount_paid_7: record["10-06-2025"] || 0,
    Amount_Paid_8: record["11-06-2025"] || 0,
    Amount_Paid_9: record["12-06-2025"] || 0,
    Amount_Paid_10: record["13-06-2025"] || 0,
    Amount_Paid_11: record["14-06-2025"] || 0,
    Amount_Paid_12: record["16-06-2025"] || 0,
  };
}

/**
 * Converts legacy numbered loan record to new date-based format
 */
export function adaptLegacyToLoanRecord(legacy: LegacyLoanBookRecord): LoanBookLiveRecord {
  return {
    id: legacy.id,
    client_name: legacy.client_name,
    amount_returnable: legacy.amount_returnable,
    // Map numbered payments to date-based payments
    "30-05-2025": legacy.amount_paid_1 || 0,
    "31-05-2025": legacy.amount_paid_2 || 0,
    "02-06-2025": legacy.amount_paid_3 || 0,
    "04-06-2025": legacy.amount_paid_4 || 0,
    "05-06-2025": legacy.amount_paid_5 || 0,
    "07-06-2025": legacy.Amount_paid_6 || 0,
    "10-06-2025": legacy.Amount_paid_7 || 0,
    "11-06-2025": legacy.Amount_Paid_8 || 0,
    "12-06-2025": legacy.Amount_Paid_9 || 0,
    "13-06-2025": legacy.Amount_Paid_10 || 0,
    "14-06-2025": legacy.Amount_Paid_11 || 0,
    "16-06-2025": legacy.Amount_Paid_12 || 0,
    remaining_balance: legacy.remaining_balance,
    loan_date: legacy.loan_date,
    status: legacy.status,
    payment_mode: legacy.payment_mode,
    created_at: legacy.created_at,
    updated_at: legacy.updated_at,
    user_id: legacy.user_id,
    risk_score: legacy.risk_score,
    default_probability: legacy.default_probability,
    risk_level: legacy.risk_level,
    risk_factors: legacy.risk_factors || {},
  };
}
