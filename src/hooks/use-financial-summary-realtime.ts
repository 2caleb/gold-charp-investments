
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFinancialSummaryRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up real-time subscriptions for financial data...');

    // Subscribe to financial_summary changes
    const financialSummaryChannel = supabase
      .channel('financial_summary_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_summary' },
        (payload) => {
          console.log('Financial summary updated:', payload);
          
          // Invalidate and refetch financial summary queries
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['premium-financial-overview'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
          
          // Show notification for significant updates
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            toast({
              title: "Financial Data Updated",
              description: "Active loans and collection rates have been automatically updated",
              variant: "default"
            });
          }
        }
      )
      .subscribe();

    // Subscribe to loan_book_live changes
    const loanBookChannel = supabase
      .channel('loan_book_live_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_book_live' },
        (payload) => {
          console.log('Loan book updated:', payload);
          
          // Invalidate queries that depend on loan book data
          queryClient.invalidateQueries({ queryKey: ['loan-book-live'] });
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['premium-financial-overview'] });
        }
      )
      .subscribe();

    // Subscribe to financial_transactions changes
    const transactionsChannel = supabase
      .channel('financial_transactions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_transactions' },
        (payload) => {
          console.log('Financial transactions updated:', payload);
          
          // Invalidate queries that depend on transaction data
          queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['premium-financial-overview'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up financial real-time subscriptions');
      supabase.removeChannel(financialSummaryChannel);
      supabase.removeChannel(loanBookChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [queryClient, toast]);
};
