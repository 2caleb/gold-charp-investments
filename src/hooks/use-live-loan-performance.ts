import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';

export const useLiveLoanPerformance = (clientName: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query only fetches and ensures default values for ALL 12 payment columns
  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['live-loan-performance', clientName],
    queryFn: async (): Promise<LoanBookLiveRecord[]> => {
      // Try exact match
      let { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .eq('client_name', clientName)
        .order('loan_date', { ascending: false });

      // If no exact match, try case-insensitive
      if (!data || data.length === 0) {
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('loan_book_live')
          .select('*')
          .ilike('client_name', `%${clientName.trim()}%`)
          .order('loan_date', { ascending: false });
        data = fuzzyData;
        error = fuzzyError;
      }

      if (error) throw error;

      // Map each record so every payment field exists (fallback to 0)
      return (data || []).map((loan): LoanBookLiveRecord => ({
        id: loan.id,
        client_name: loan.client_name,
        amount_returnable: loan.amount_returnable ?? 0,
        amount_paid_1: loan.amount_paid_1 ?? 0,
        amount_paid_2: loan.amount_paid_2 ?? 0,
        amount_paid_3: loan.amount_paid_3 ?? 0,
        amount_paid_4: loan.amount_paid_4 ?? 0,
        amount_paid_5: loan.amount_paid_5 ?? 0,
        Amount_paid_6: loan.Amount_paid_6 ?? 0,
        Amount_paid_7: loan.Amount_paid_7 ?? 0,
        Amount_Paid_8: loan.Amount_Paid_8 ?? 0,
        Amount_Paid_9: loan.Amount_Paid_9 ?? 0,
        Amount_Paid_10: loan.Amount_Paid_10 ?? 0,
        Amount_Paid_11: loan.Amount_Paid_11 ?? 0,
        Amount_Paid_12: loan.Amount_Paid_12 ?? 0,
        remaining_balance: loan.remaining_balance ?? 0,
        loan_date: loan.loan_date || "",
        status: loan.status || "",
        payment_mode: loan.payment_mode || "",
        created_at: loan.created_at || "",
        updated_at: loan.updated_at || "",
        user_id: loan.user_id ?? null,
      }));
    },
    enabled: !!clientName,
    refetchInterval: 30000,
  });

  // Real-time subscription logic remains unchanged
  useEffect(() => {
    if (!clientName) return;
    const channel = supabase
      .channel('loan-performance-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'loan_book_live',
          filter: `client_name=ilike.%${clientName}%`
        },
        (payload) => {
          queryClient.invalidateQueries({ 
            queryKey: ['live-loan-performance', clientName] 
          });
          if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Loan Payment Updated',
              description: `Payment record updated for ${clientName}`,
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientName, queryClient, toast]);

  return { data: loanData, isLoading, error };
};
