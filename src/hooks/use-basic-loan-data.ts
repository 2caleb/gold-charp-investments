
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BasicLoanData {
  id: string;
  client_name: string;
  amount_returnable: number;
  remaining_balance: number;
  status: string;
  loan_date: string;
}

export const useBasicLoanData = () => {
  return useQuery({
    queryKey: ['basic-loan-data'],
    queryFn: async (): Promise<BasicLoanData[]> => {
      const { data, error } = await supabase
        .from('loan_book_live')
        .select('id, client_name, amount_returnable, remaining_balance, status, loan_date')
        .order('loan_date', { ascending: false });

      if (error) throw error;

      return data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
