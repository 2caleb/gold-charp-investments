
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiveExpense {
  id: string;
  particulars: string;
  amount: number;
  category: string;
  Account: string;
  expense_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useLiveExpensesData = () => {
  return useQuery({
    queryKey: ['live-expenses-data'],
    queryFn: async (): Promise<LiveExpense[]> => {
      const { data, error } = await supabase
        .from('expenses_live')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });
};
