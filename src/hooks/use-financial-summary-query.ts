
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFinancialSummaryQuery = () => {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      console.log('Fetching financial summary...');
      
      const { data, error } = await supabase
        .from('financial_summary')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching financial summary:', error);
      }

      return data;
    },
  });
};
