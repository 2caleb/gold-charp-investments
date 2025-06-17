
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialSummaryRealtime } from './use-financial-summary-realtime';

export const useEnhancedFinancialSummaryQuery = () => {
  // Set up real-time subscriptions
  useFinancialSummaryRealtime();

  return useQuery({
    queryKey: ['enhanced-financial-summary'],
    queryFn: async () => {
      console.log('Fetching enhanced financial summary with live data...');
      
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

      // Get additional real-time metrics from loan_book_live
      const { data: loanBookData, error: loanBookError } = await supabase
        .from('loan_book_live')
        .select('*')
        .eq('status', 'active');

      if (loanBookError) {
        console.error('Error fetching loan book live data:', loanBookError);
      }

      // Calculate real-time active loans count
      const realTimeActiveLoanHolders = loanBookData?.length || 0;
      
      // Calculate real-time collection rate using date-based payments
      const totalPortfolio = loanBookData?.reduce((sum, loan) => sum + (loan.amount_returnable || 0), 0) || 0;
      const totalRepaid = loanBookData?.reduce((sum, loan) => 
        sum + 
        (loan["30-05-2025"] || 0) + (loan["31-05-2025"] || 0) + 
        (loan["02-06-2025"] || 0) + (loan["04-06-2025"] || 0) + 
        (loan["05-06-2025"] || 0) + (loan["07-06-2025"] || 0) + 
        (loan["10-06-2025"] || 0) + (loan["11-06-2025"] || 0) + 
        (loan["12-06-2025"] || 0) + (loan["13-06-2025"] || 0) + 
        (loan["14-06-2025"] || 0) + (loan["16-06-2025"] || 0), 0) || 0;
      
      const realTimeCollectionRate = totalPortfolio > 0 ? (totalRepaid / totalPortfolio) * 100 : 0;

      const enhancedData = {
        ...summaryData,
        real_time_active_loan_holders: realTimeActiveLoanHolders,
        real_time_collection_rate: Math.min(realTimeCollectionRate, 100),
        real_time_total_portfolio: totalPortfolio,
        real_time_total_repaid: totalRepaid,
        last_calculated: summaryData?.calculated_at || new Date().toISOString(),
        is_live_data: true
      };

      console.log('Enhanced financial summary:', enhancedData);
      return enhancedData;
    },
    refetchInterval: 60000, // Backup refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};
