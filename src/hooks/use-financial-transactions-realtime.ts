
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFinancialTransactionsRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up real-time subscriptions for financial transactions...');

    // Subscribe to financial_transactions changes
    const transactionsChannel = supabase
      .channel('financial_transactions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_transactions' },
        (payload) => {
          console.log('Financial transactions updated:', payload);
          
          // Invalidate and refetch related queries
          queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-financial-sync'] });
          queryClient.invalidateQueries({ queryKey: ['premium-financial-overview'] });
          queryClient.invalidateQueries({ queryKey: ['loan-book-live'] });
          queryClient.invalidateQueries({ queryKey: ['expenses-live'] });
          
          // Show notification for changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Transaction Added",
              description: "Financial data has been updated automatically",
              variant: "default"
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Transaction Updated",
              description: "Changes saved successfully",
              variant: "default"
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Transaction Deleted",
              description: "Transaction removed from records",
              variant: "default"
            });
          }
        }
      )
      .subscribe();

    // Also subscribe to financial_summary changes
    const summaryChannel = supabase
      .channel('financial_summary_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_summary' },
        (payload) => {
          console.log('Financial summary updated:', payload);
          
          // Invalidate financial summary queries
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-financial-sync'] });
          queryClient.invalidateQueries({ queryKey: ['premium-financial-overview'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up financial transactions real-time subscriptions');
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(summaryChannel);
    };
  }, [queryClient, toast]);
};
