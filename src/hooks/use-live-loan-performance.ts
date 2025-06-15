import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';

// Utility to validate payment columns at runtime (will log if anything is missing/wrong)
function validateLoanBookRecordSchema(obj: any): LoanBookLiveRecord | null {
  const requiredFields = [
    'id', 'client_name', 'amount_returnable', 'amount_paid_1', 'amount_paid_2', 'amount_paid_3',
    'amount_paid_4', 'amount_paid_5', 'Amount_paid_6', 'Amount_paid_7', 'Amount_Paid_8',
    'Amount_Paid_9', 'Amount_Paid_10', 'Amount_Paid_11', 'Amount_Paid_12', 'remaining_balance',
    'loan_date', 'status', 'payment_mode', 'created_at', 'updated_at',
    'risk_score', 'default_probability', 'risk_level', 'risk_factors',
  ];
  let ok = true;
  requiredFields.forEach(f => {
    if (!(f in obj)) {
      console.warn(`[LoanBookLiveRecord] Missing field: ${f}`, obj);
      ok = false;
    }
  });
  // Optionally: Type check specific fields
  return ok ? obj as LoanBookLiveRecord : null;
}

export const useLiveLoanPerformance = (clientName: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch only: NO transformations, everything as raw as possible with zero calculations.
  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['live-loan-performance', clientName],
    queryFn: async (): Promise<LoanBookLiveRecord[]> => {
      let { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .ilike('client_name', `%${clientName?.trim() || ''}%`)
        .order('loan_date', { ascending: false });

      if (error) throw error;

      // Ensure all records are valid types, fallback missing payments to 0
      const mapped = (data || []).map(loan => {
        // Defensive: apply 0 default for any missing Number fields
        const record: LoanBookLiveRecord = {
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
          loan_date: String(loan.loan_date || ""),
          status: loan.status || "",
          payment_mode: loan.payment_mode || "",
          created_at: String(loan.created_at || ""),
          updated_at: String(loan.updated_at || ""),
          user_id: loan.user_id ?? null,
          risk_score: loan.risk_score ?? 0,
          default_probability: loan.default_probability ?? 0,
          risk_level: (loan.risk_level || "low"),
          risk_factors: loan.risk_factors || {},
        };
        validateLoanBookRecordSchema(record);
        return record;
      });
      return mapped;
    },
    enabled: !!clientName,
    refetchInterval: 30000,
  });

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
