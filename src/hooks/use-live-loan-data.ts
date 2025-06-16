
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';

export const useLiveLoanData = () => {
  return useQuery({
    queryKey: ['live-loan-data'],
    queryFn: async (): Promise<LoanBookLiveRecord[]> => {
      const { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });
};
