
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveLoanData {
  id: string;
  client_name: string;
  amount_returnable: number;
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  amount_paid_4: number;
  amount_paid_5: number;
  Amount_paid_6: number;
  Amount_paid_7: number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedLoanData extends LiveLoanData {
  totalPaid: number;
  progress: number;
  activePayments: number[];
  recentlyUpdated: boolean;
  isCompleted: boolean;
}

export const useLiveLoanPerformance = (clientName: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['live-loan-performance', clientName],
    queryFn: async (): Promise<EnhancedLoanData[]> => {
      console.log('Fetching live loan performance for client:', clientName);
      
      // First try exact match
      let { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .eq('client_name', clientName)
        .order('loan_date', { ascending: false });

      // If no exact match, try case-insensitive and trimmed match
      if (!data || data.length === 0) {
        console.log('No exact match found, trying case-insensitive search...');
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('loan_book_live')
          .select('*')
          .ilike('client_name', `%${clientName.trim()}%`)
          .order('loan_date', { ascending: false });
        
        data = fuzzyData;
        error = fuzzyError;
      }

      if (error) {
        console.error('Error fetching loan performance:', error);
        throw error;
      }

      // Smart filtering and enhancement
      const enhancedData: EnhancedLoanData[] = (data || [])
        .filter(loan => {
          // Filter out inactive/invalid loans
          return loan.client_name && 
                 loan.client_name.trim() !== '' && 
                 loan.amount_returnable > 0;
        })
        .map(loan => {
          const paymentAmounts = [
            loan.amount_paid_1 || 0,
            loan.amount_paid_2 || 0,
            loan.amount_paid_3 || 0,
            loan.amount_paid_4 || 0,
            loan.amount_paid_5 || 0,
            loan.Amount_paid_6 || 0,
            loan.Amount_paid_7 || 0
          ];

          const totalPaid = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
          const progress = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
          
          // Find which payment slots have values
          const activePayments = paymentAmounts
            .map((amount, index) => ({ amount, index: index + 1 }))
            .filter(payment => payment.amount > 0)
            .map(payment => payment.index);

          // Check if recently updated (within last 24 hours)
          const updatedAt = new Date(loan.updated_at || loan.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
          const recentlyUpdated = hoursDiff <= 24;

          const isCompleted = progress >= 100 || loan.status === 'completed';

          return {
            ...loan,
            totalPaid,
            progress,
            activePayments,
            recentlyUpdated,
            isCompleted
          };
        })
        .sort((a, b) => {
          // Sort by: recently updated first, then active loans, then by date
          if (a.recentlyUpdated && !b.recentlyUpdated) return -1;
          if (!a.recentlyUpdated && b.recentlyUpdated) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          if (a.isCompleted && !b.isCompleted) return 1;
          return new Date(b.loan_date).getTime() - new Date(a.loan_date).getTime();
        });

      console.log('Enhanced loan data:', enhancedData.length, 'records processed');
      return enhancedData;
    },
    enabled: !!clientName,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!clientName) return;

    console.log('Setting up real-time subscription for loan performance...');
    
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
          console.log('Real-time loan update received:', payload);
          
          // Invalidate and refetch the query
          queryClient.invalidateQueries({ 
            queryKey: ['live-loan-performance', clientName] 
          });

          // Show notification for updates
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
      console.log('Cleaning up loan performance real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [clientName, queryClient, toast]);

  return { data: loanData, isLoading, error };
};
