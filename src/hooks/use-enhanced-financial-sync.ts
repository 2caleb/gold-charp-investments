
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
      
      try {
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
          // Don't throw here, just log and continue with empty data
        }

        // Get financial transactions with the new structure
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
          // Don't throw here, just log and continue with empty data
        }

        // Get manual financial management entries
        const { data: financialManagementData, error: financialManagementError } = await supabase
          .from('financial_management')
          .select('*')
          .eq('approval_status', 'approved')
          .eq('status', 'active');

        if (financialManagementError) {
          console.error('Error fetching financial management data:', financialManagementError);
        }

        // Get active financial adjustments
        const { data: adjustmentsData, error: adjustmentsError } = await supabase
          .from('financial_adjustments')
          .select('*')
          .eq('status', 'active')
          .lte('effective_date', new Date().toISOString().split('T')[0])
          .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString().split('T')[0]);

        if (adjustmentsError) {
          console.error('Error fetching adjustments data:', adjustmentsError);
        }

        // Calculate real-time metrics
        const realTimeActiveLoanHolders = loanBookData?.length || 0;
        const totalPortfolio = loanBookData?.reduce((sum, loan) => sum + (loan.amount_returnable || 0), 0) || 0;
        const totalRepaid = loanBookData?.reduce((sum, loan) => 
          sum + (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0), 0) || 0;
        
        const realTimeCollectionRate = totalPortfolio > 0 ? (totalRepaid / totalPortfolio) * 100 : 0;

        // Calculate transaction totals with the new table structure
        const transactionIncome = transactionsData?.reduce((sum, transaction) => {
          if (transaction.transaction_type === 'income' && transaction.status === 'completed') {
            return sum + (transaction.amount || 0);
          }
          return sum;
        }, 0) || 0;

        const transactionExpenses = transactionsData?.reduce((sum, transaction) => {
          if (transaction.transaction_type === 'expense' && transaction.status === 'completed') {
            return sum + (transaction.amount || 0);
          }
          return sum;
        }, 0) || 0;

        // Calculate manual financial management totals
        const manualIncome = financialManagementData?.reduce((sum, entry) => {
          if (entry.entry_type === 'manual_income') {
            return sum + (entry.amount || 0);
          }
          return sum;
        }, 0) || 0;

        const manualExpenses = financialManagementData?.reduce((sum, entry) => {
          if (entry.entry_type === 'manual_expense') {
            return sum + (entry.amount || 0);
          }
          return sum;
        }, 0) || 0;

        // Apply financial adjustments
        let adjustedIncome = transactionIncome + manualIncome;
        let adjustedExpenses = transactionExpenses + manualExpenses;
        let adjustedPortfolio = totalPortfolio;
        let adjustedCollectionRate = realTimeCollectionRate;

        adjustmentsData?.forEach(adjustment => {
          switch (adjustment.adjustment_type) {
            case 'income_adjustment':
              adjustedIncome = adjustment.adjusted_value;
              break;
            case 'expense_adjustment':
              adjustedExpenses = adjustment.adjusted_value;
              break;
            case 'portfolio_adjustment':
              adjustedPortfolio = adjustment.adjusted_value;
              break;
            case 'collection_rate_override':
              adjustedCollectionRate = adjustment.adjusted_value;
              break;
          }
        });

        const totalIncome = adjustedIncome;
        const totalExpenses = adjustedExpenses;

        const synchronizedData = {
          // From financial_summary table
          ...summaryData,
          
          // Real-time calculated metrics
          real_time_active_loan_holders: realTimeActiveLoanHolders,
          real_time_collection_rate: Math.min(adjustedCollectionRate, 100),
          real_time_total_portfolio: adjustedPortfolio,
          real_time_total_repaid: totalRepaid,
          real_time_total_income: totalIncome,
          real_time_total_expenses: totalExpenses,
          real_time_net_income: totalIncome - totalExpenses,
          
          // Manual financial entries
          manual_income: manualIncome,
          manual_expenses: manualExpenses,
          
          // Use enhanced data over summary data when available
          total_income: totalIncome > 0 ? totalIncome : (summaryData?.total_income || 0),
          total_expenses: totalExpenses > 0 ? totalExpenses : (summaryData?.total_expenses || 0),
          net_income: (totalIncome - totalExpenses) !== 0 ? (totalIncome - totalExpenses) : (summaryData?.net_income || 0),
          total_loan_portfolio: adjustedPortfolio > 0 ? adjustedPortfolio : (summaryData?.total_loan_portfolio || 0),
          collection_rate: adjustedCollectionRate > 0 ? adjustedCollectionRate : (summaryData?.collection_rate || 0),
          
          // Adjustment indicators
          has_active_adjustments: (adjustmentsData?.length || 0) > 0,
          adjustments_count: adjustmentsData?.length || 0,
          
          // Metadata
          last_calculated: summaryData?.calculated_at || new Date().toISOString(),
          is_live_data: true,
          sync_status: 'synchronized'
        };

        console.log('Enhanced synchronized financial data:', synchronizedData);
        return synchronizedData;
        
      } catch (error) {
        console.error('Error in useEnhancedFinancialSync:', error);
        // Return fallback data structure to prevent UI crashes
        return {
          total_loan_portfolio: 0,
          total_repaid: 0,
          outstanding_balance: 0,
          total_income: 0,
          total_expenses: 0,
          active_loan_holders: 0,
          collection_rate: 0,
          net_income: 0,
          real_time_active_loan_holders: 0,
          real_time_collection_rate: 0,
          real_time_total_portfolio: 0,
          real_time_total_repaid: 0,
          real_time_total_income: 0,
          real_time_total_expenses: 0,
          real_time_net_income: 0,
          manual_income: 0,
          manual_expenses: 0,
          has_active_adjustments: false,
          adjustments_count: 0,
          last_calculated: new Date().toISOString(),
          is_live_data: false,
          sync_status: 'error'
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds as backup
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
