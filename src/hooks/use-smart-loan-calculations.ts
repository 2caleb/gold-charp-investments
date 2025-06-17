
import { useMemo } from 'react';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';
import { scoreLoanRisk } from './riskScoringUtils';
import { supabase } from '@/integrations/supabase/client';

export interface SmartLoanData extends LoanBookLiveRecord {
  // Smart calculated fields
  calculated_total_paid: number;
  calculated_remaining_balance: number;
  calculated_progress: number;
  
  // Data quality indicators
  data_quality_score: number;
  has_calculation_errors: boolean;
  discrepancies: string[];
  confidence_level: 'high' | 'medium' | 'low';
  
  // Smart insights
  payment_pattern: 'regular' | 'irregular' | 'declining' | 'accelerating';
  estimated_completion_date: string | null;
  collection_efficiency: number;
  
  // Enhanced display data
  activePayments: number[];
  recentlyUpdated: boolean;
  isCompleted: boolean;
}

export const useSmartLoanCalculations = (rawLoanData: LoanBookLiveRecord[]) => {
  const smartCalculatedData = useMemo(() => {
    return rawLoanData.map((loan): SmartLoanData => {
      // Extract payment amounts from date-based columns
      const paymentAmounts = [
        loan["30-05-2025"] || 0,
        loan["31-05-2025"] || 0,
        loan["02-06-2025"] || 0,
        loan["04-06-2025"] || 0,
        loan["05-06-2025"] || 0,
        loan["07-06-2025"] || 0,
        loan["10-06-2025"] || 0,
        loan["11-06-2025"] || 0,
        loan["12-06-2025"] || 0,
        loan["13-06-2025"] || 0,
        loan["14-06-2025"] || 0,
        loan["16-06-2025"] || 0,
      ];

      const calculated_total_paid = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
      const calculated_remaining_balance = Math.max(0, loan.amount_returnable - calculated_total_paid);
      const calculated_progress = loan.amount_returnable > 0 ? (calculated_total_paid / loan.amount_returnable) * 100 : 0;

      // Data quality validation
      const discrepancies: string[] = [];
      let data_quality_score = 100;

      const stored_remaining_diff = Math.abs((loan.remaining_balance || 0) - calculated_remaining_balance);
      if (stored_remaining_diff > 1) {
        discrepancies.push(`Remaining balance mismatch: stored ${loan.remaining_balance}, calculated ${calculated_remaining_balance}`);
        data_quality_score -= 20;
      }
      if (calculated_total_paid > loan.amount_returnable) {
        discrepancies.push('Total payments exceed loan amount');
        data_quality_score -= 30;
      }
      const hasNegativePayments = paymentAmounts.some(amount => amount < 0);
      if (hasNegativePayments) {
        discrepancies.push('Contains negative payment amounts');
        data_quality_score -= 25;
      }

      // Pattern analysis
      const activePayments = paymentAmounts
        .map((amount, index) => ({ amount, index: index + 1 }))
        .filter(payment => payment.amount > 0)
        .map(payment => payment.index);

      let payment_pattern: 'regular' | 'irregular' | 'declining' | 'accelerating' = 'regular';
      if (activePayments.length >= 3) {
        const nonZeroAmounts = paymentAmounts.filter(amount => amount > 0);
        const isIncreasing = nonZeroAmounts.every((amount, i) => i === 0 || amount >= nonZeroAmounts[i - 1]);
        const isDecreasing = nonZeroAmounts.every((amount, i) => i === 0 || amount <= nonZeroAmounts[i - 1]);
        if (isIncreasing && !isDecreasing) payment_pattern = 'accelerating';
        else if (isDecreasing && !isIncreasing) payment_pattern = 'declining';
        else if (new Set(nonZeroAmounts).size === 1) payment_pattern = 'regular';
        else payment_pattern = 'irregular';
      }

      // Collection efficiency
      const loanAge = Math.max(1, Math.floor((new Date().getTime() - new Date(loan.loan_date).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const expectedPayments = Math.min(loanAge, 12);
      const actualPayments = activePayments.length;
      const collection_efficiency = expectedPayments > 0 ? (actualPayments / expectedPayments) * 100 : 0;

      // Estimated completion
      let estimated_completion_date: string | null = null;
      if (calculated_progress < 100 && activePayments.length >= 2) {
        const nonZeroAmounts = paymentAmounts.filter(amount => amount > 0);
        const recentPayments = nonZeroAmounts.slice(-2);
        const avgPayment = recentPayments.reduce((sum, amt) => sum + amt, 0) / recentPayments.length;
        if (avgPayment > 0) {
          const remainingAmount = calculated_remaining_balance;
          const monthsToComplete = Math.ceil(remainingAmount / avgPayment);
          const completionDate = new Date();
          completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
          estimated_completion_date = completionDate.toISOString().split('T')[0];
        }
      }

      // Confidence level
      let confidence_level: 'high' | 'medium' | 'low' = 'high';
      if (data_quality_score < 70) confidence_level = 'low';
      else if (data_quality_score < 85) confidence_level = 'medium';

      // Enhanced status detection
      const recentlyUpdated = () => {
        const updatedAt = new Date(loan.updated_at || loan.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      };
      const isCompleted = calculated_progress >= 100 || loan.status === 'completed';

      // Risk scoring enrichment (use existing values or calculate new ones)
      const {
        risk_score,
        default_probability,
        risk_level,
        risk_factors,
      } = scoreLoanRisk(loan);

      // Log risk changes (with proper JSON serialization)
      if (
        loan.risk_score !== risk_score ||
        loan.default_probability !== default_probability ||
        loan.risk_level !== risk_level
      ) {
        (async () => {
          try {
            // Convert loan object to plain JSON for database storage
            const loanForJson = JSON.parse(JSON.stringify(loan));
            
            await supabase.from("loan_risk_prediction_log").insert({
              loan_id: loan.id,
              risk_score,
              default_probability,
              model_version: "rule-based-v1",
              model_input: loanForJson,
              model_output: { risk_score, default_probability, risk_level, risk_factors },
            });
          } catch (err) {
            console.warn("Risk log insert failed:", err);
          }
        })();
      }

      return {
        ...loan,
        calculated_total_paid,
        calculated_remaining_balance,
        calculated_progress: Math.min(calculated_progress, 100),
        data_quality_score: Math.max(0, data_quality_score),
        has_calculation_errors: discrepancies.length > 0,
        discrepancies,
        confidence_level,
        payment_pattern,
        estimated_completion_date,
        collection_efficiency: Math.min(collection_efficiency, 100),
        activePayments,
        recentlyUpdated: recentlyUpdated(),
        isCompleted,
        // Use calculated or existing risk values
        risk_score,
        default_probability,
        risk_level,
        risk_factors,
      };
    });
  }, [rawLoanData]);

  // Calculate smart portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const reliableLoans = smartCalculatedData.filter(loan => loan.confidence_level !== 'low');
    const totalReliablePortfolio = reliableLoans.reduce((sum, loan) => sum + loan.amount_returnable, 0);
    const totalReliablePaid = reliableLoans.reduce((sum, loan) => sum + loan.calculated_total_paid, 0);
    const totalReliableRemaining = reliableLoans.reduce((sum, loan) => sum + loan.calculated_remaining_balance, 0);
    const averageCollectionEfficiency = reliableLoans.length > 0 
      ? reliableLoans.reduce((sum, loan) => sum + loan.collection_efficiency, 0) / reliableLoans.length 
      : 0;
    const dataQualityIssues = smartCalculatedData.filter(loan => loan.has_calculation_errors).length;
    const overallDataQuality = smartCalculatedData.length > 0 
      ? smartCalculatedData.reduce((sum, loan) => sum + loan.data_quality_score, 0) / smartCalculatedData.length 
      : 100;

    return {
      reliable_total_portfolio: totalReliablePortfolio,
      reliable_total_paid: totalReliablePaid,
      reliable_total_remaining: totalReliableRemaining,
      reliable_collection_rate: totalReliablePortfolio > 0 ? (totalReliablePaid / totalReliablePortfolio) * 100 : 0,
      total_loans: smartCalculatedData.length,
      reliable_loans: reliableLoans.length,
      data_quality_issues: dataQualityIssues,
      overall_data_quality: overallDataQuality,
      average_collection_efficiency: averageCollectionEfficiency,
      loans_needing_attention: smartCalculatedData.filter(loan => 
        loan.confidence_level === 'low' || loan.collection_efficiency < 50
      ).length
    };
  }, [smartCalculatedData]);

  return {
    smartLoanData: smartCalculatedData,
    portfolioMetrics,
    hasDataQualityIssues: portfolioMetrics.data_quality_issues > 0,
    dataQualityScore: portfolioMetrics.overall_data_quality
  };
};
