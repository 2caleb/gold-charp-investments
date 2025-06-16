
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoanBookLiveRecord {
  id: string;
  client_name: string;
  amount_returnable: number;
  remaining_balance: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  default_probability: number;
  risk_factors: Record<string, any>;
  status: string;
  amount_paid_1: number | null;
  amount_paid_2: number | null;
  amount_paid_3: number | null;
  amount_paid_4: number | null;
  amount_paid_5: number | null;
  Amount_paid_6: number | null;
  Amount_paid_7: number | null;
  Amount_Paid_8: number | null;
  Amount_Paid_9: number | null;
  Amount_Paid_10: number | null;
  Amount_Paid_11: number | null;
  Amount_Paid_12: number | null;
  loan_date: string;
  payment_mode: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useLiveLoanData = () => {
  return useQuery({
    queryKey: ['live-loan-data'],
    queryFn: async (): Promise<LoanBookLiveRecord[]> => {
      const { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      return (data || []).map(loan => ({
        ...loan,
        risk_level: (['low', 'medium', 'high', 'critical'].includes(loan.risk_level) 
          ? loan.risk_level 
          : 'low') as 'low' | 'medium' | 'high' | 'critical',
        risk_factors: typeof loan.risk_factors === 'string' 
          ? JSON.parse(loan.risk_factors) 
          : (loan.risk_factors || {})
      }));
    },
    refetchInterval: 30000,
  });
};
