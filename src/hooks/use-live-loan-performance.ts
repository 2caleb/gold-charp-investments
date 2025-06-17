
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';

// Utility to validate payment columns at runtime
function validateLoanBookRecordSchema(obj: any): LoanBookLiveRecord | null {
  const requiredFields = [
    'id', 'client_name', 'amount_returnable', 'remaining_balance',
    'loan_date', 'status', 'payment_mode', 'created_at', 'updated_at',
    'risk_score', 'default_probability', 'risk_level'
  ];
  
  const dateBasedColumns = [
    "30-05-2025", "31-05-2025", "02-06-2025", "04-06-2025", "05-06-2025",
    "07-06-2025", "10-06-2025", "11-06-2025", "12-06-2025", "13-06-2025",
    "14-06-2025", "16-06-2025"
  ];
  
  let ok = true;
  requiredFields.forEach(f => {
    if (!(f in obj)) {
      console.warn(`[LoanBookLiveRecord] Missing required field: ${f}`, obj);
      ok = false;
    }
  });
  
  // Check for at least some date-based payment columns
  const hasDateColumns = dateBasedColumns.some(col => col in obj);
  if (!hasDateColumns) {
    console.warn(`[LoanBookLiveRecord] Missing date-based payment columns`, obj);
  }
  
  return ok ? obj as LoanBookLiveRecord : null;
}

export const useLiveLoanPerformance = (clientName: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['live-loan-performance', clientName],
    queryFn: async (): Promise<LoanBookLiveRecord[]> => {
      let { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .ilike('client_name', `%${clientName?.trim() || ''}%`)
        .order('loan_date', { ascending: false });

      if (error) throw error;

      // Map and validate records with proper defaults
      const mapped = (data || []).map(loan => {
        const record: LoanBookLiveRecord = {
          id: loan.id,
          client_name: loan.client_name,
          amount_returnable: loan.amount_returnable ?? 0,
          // Map date-based payment columns with defaults
          "30-05-2025": loan["30-05-2025"] ?? 0,
          "31-05-2025": loan["31-05-2025"] ?? 0,
          "02-06-2025": loan["02-06-2025"] ?? 0,
          "04-06-2025": loan["04-06-2025"] ?? 0,
          "05-06-2025": loan["05-06-2025"] ?? 0,
          "07-06-2025": loan["07-06-2025"] ?? 0,
          "10-06-2025": loan["10-06-2025"] ?? 0,
          "11-06-2025": loan["11-06-2025"] ?? 0,
          "12-06-2025": loan["12-06-2025"] ?? 0,
          "13-06-2025": loan["13-06-2025"] ?? 0,
          "14-06-2025": loan["14-06-2025"] ?? 0,
          "16-06-2025": loan["16-06-2025"] ?? 0,
          remaining_balance: loan.remaining_balance ?? 0,
          loan_date: String(loan.loan_date || ""),
          status: loan.status || "",
          payment_mode: loan.payment_mode || "",
          created_at: String(loan.created_at || ""),
          updated_at: String(loan.updated_at || ""),
          user_id: loan.user_id ?? null,
          // Risk analytics fields
          risk_score: loan.risk_score ?? 0,
          default_probability: loan.default_probability ?? 0,
          risk_level: loan.risk_level ?? 'low',
          risk_factors: loan.risk_factors ?? {},
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
