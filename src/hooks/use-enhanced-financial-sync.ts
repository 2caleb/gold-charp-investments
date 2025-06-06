
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialSummaryRealtime } from './use-financial-summary-realtime';
import { useFinancialTransactionsRealtime } from './use-financial-transactions-realtime';

export const useEnhancedFinancialSync = () => {
  // Set up all real-time subscriptions
  useFinancialSummaryRealtime();
  useFinancialTransactionsRealtime();

  return useQuery({
    queryKey: ['enhanced-financial-sync'],
    queryFn: async () => {
      console.log('Fetching synchronized financial data...');
      
      // Get the latest financial summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('financial_summary')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Error fetching financial summary:', summaryError);
        throw summaryError;
      }

      // Get real-time metrics from loan_book_live
      const { data: loanBookData, error: loanBookError } = await supabase
        .from('loan_book_live')
        .select('*')
        .eq('status', 'active');

      if (loanBookError) {
        console.error('Error fetching loan book live data:', loanBookError);
      }

      // Get financial transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      }

      // Calculate real-time metrics
      const realTimeActiveLoanHolders = loanBookData?.length || 0;
      const totalPortfolio = loanBookData?.reduce((sum, loan) => sum + (loan.amount_returnable || 0), 0) || 0;
      const totalRepaid = loanBookData?.reduce((sum, loan) => 
        sum + (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0), 0) || 0;
      
      const realTimeCollectionRate = totalPortfolio > 0 ? (totalRepaid / totalPortfolio) * 100 : 0;

      // Calculate transaction totals
      const totalIncome = transactionsData?.reduce((sum, transaction) => {
        if (transaction.transaction_type === 'income') {
          return sum + (transaction.Amount || parseFloat(transaction.amount?.replace(/[^0-9.-]/g, '') || '0'));
        }
        return sum;
      }, 0) || 0;

      const totalExpenses = transactionsData?.reduce((sum, transaction) => {
        if (transaction.transaction_type === 'expense') {
          return sum + (transaction.Amount || parseFloat(transaction.amount?.replace(/[^0-9.-]/g, '') || '0'));
        }
        return sum;
      }, 0) || 0;

      const synchronizedData = {
        // From financial_summary table
        ...summaryData,
        
        // Real-time calculated metrics
        real_time_active_loan_holders: realTimeActiveLoanHolders,
        real_time_collection_rate: Math.min(realTimeCollectionRate, 100),
        real_time_total_portfolio: totalPortfolio,
        real_time_total_repaid: totalRepaid,
        real_time_total_income: totalIncome,
        real_time_total_expenses: totalExpenses,
        real_time_net_income: totalIncome - totalExpenses,
        
        // Metadata
        last_calculated: summaryData?.calculated_at || new Date().toISOString(),
        is_live_data: true,
        sync_status: 'synchronized'
      };

      console.log('Synchronized financial data:', synchronizedData);
      return synchronizedData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds as backup
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};
