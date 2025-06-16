
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
      
      // Transform the data to ensure types match the interface
      return (data || []).map(loan => ({
        ...loan,
        risk_level: ['low', 'medium', 'high', 'critical'].includes(loan.risk_level) 
          ? loan.risk_level as 'low' | 'medium' | 'high' | 'critical'
          : 'low',
        risk_factors: typeof loan.risk_factors === 'object' && loan.risk_factors !== null
          ? loan.risk_factors as Record<string, any>
          : {}
      }));
    },
    refetchInterval: 30000,
  });
};
