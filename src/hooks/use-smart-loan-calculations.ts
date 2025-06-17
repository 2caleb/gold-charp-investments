import { useMemo } from 'react';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';

export interface SmartLoanCalculationsResult {
  smartLoanData: SmartLoanData[];
  portfolioMetrics: PortfolioMetrics;
  hasDataQualityIssues: boolean;
  dataQualityScore: number;
}

export interface SmartLoanData extends LoanBookLiveRecord {
  // Legacy numbered payment columns for compatibility
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  amount_paid_4: number;
  amount_paid_5: number;
  Amount_paid_6: number;
  Amount_paid_7: number;
  Amount_Paid_8: number;
  Amount_Paid_9: number;
  Amount_Paid_10: number;
  Amount_Paid_11: number;
  Amount_Paid_12: number;
  
  // Smart calculation fields
  totalPaid: number;
  collectionEfficiency: number;
  collection_efficiency: number; // Added for compatibility
  isCompleted: boolean;
  recentlyUpdated: boolean;
  hasDataQualityIssues: boolean;
  paymentFrequency: number;
  averagePaymentAmount: number;
  lastPaymentDate: string | null;
  daysOverdue: number;
  riskTrend: 'improving' | 'stable' | 'deteriorating';
  
  // Additional calculated fields for DynamicLoanBookTable
  calculated_total_paid: number;
  calculated_remaining_balance: number;
  calculated_progress: number;
  data_quality_score: number;
  has_calculation_errors: boolean;
  payment_pattern: 'regular' | 'irregular' | 'none';
  activePayments: number;
  estimated_completion_date: string | null;
  confidence_level: 'high' | 'medium' | 'low';
  discrepancies: string[];
}

export interface PortfolioMetrics {
  total_loans: number;
  reliable_loans: number;
  loans_needing_attention: number;
  reliable_total_portfolio: number;
  reliable_total_paid: number;
  reliable_total_remaining: number;
  reliable_collection_rate: number;
  average_collection_efficiency: number;
}

export const useSmartLoanCalculations = (rawLoanData: LoanBookLiveRecord[]): SmartLoanCalculationsResult => {
  return useMemo(() => {
    if (!rawLoanData || rawLoanData.length === 0) {
      return {
        smartLoanData: [],
        portfolioMetrics: {
          total_loans: 0,
          reliable_loans: 0,
          loans_needing_attention: 0,
          reliable_total_portfolio: 0,
          reliable_total_paid: 0,
          reliable_total_remaining: 0,
          reliable_collection_rate: 0,
          average_collection_efficiency: 0,
        },
        hasDataQualityIssues: false,
        dataQualityScore: 100,
      };
    }

    const smartLoans: SmartLoanData[] = rawLoanData.map((loan) => {
      // Calculate total paid using date-based columns
      const totalPaid = (
        (loan["30-05-2025"] || 0) +
        (loan["31-05-2025"] || 0) +
        (loan["02-06-2025"] || 0) +
        (loan["04-06-2025"] || 0) +
        (loan["05-06-2025"] || 0) +
        (loan["07-06-2025"] || 0) +
        (loan["10-06-2025"] || 0) +
        (loan["11-06-2025"] || 0) +
        (loan["12-06-2025"] || 0) +
        (loan["13-06-2025"] || 0) +
        (loan["14-06-2025"] || 0) +
        (loan["16-06-2025"] || 0)
      );

      // Map date-based payments to legacy numbered format
      const legacyPayments = {
        amount_paid_1: loan["30-05-2025"] || 0,
        amount_paid_2: loan["31-05-2025"] || 0,
        amount_paid_3: loan["02-06-2025"] || 0,
        amount_paid_4: loan["04-06-2025"] || 0,
        amount_paid_5: loan["05-06-2025"] || 0,
        Amount_paid_6: loan["07-06-2025"] || 0,
        Amount_paid_7: loan["10-06-2025"] || 0,
        Amount_Paid_8: loan["11-06-2025"] || 0,
        Amount_Paid_9: loan["12-06-2025"] || 0,
        Amount_Paid_10: loan["13-06-2025"] || 0,
        Amount_Paid_11: loan["14-06-2025"] || 0,
        Amount_Paid_12: loan["16-06-2025"] || 0,
      };

      const collectionEfficiency = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
      const isCompleted = collectionEfficiency >= 100 || loan.status === 'completed';
      
      const loanDate = new Date(loan.loan_date);
      const daysSinceLoan = Math.floor((new Date().getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
      const recentlyUpdated = Math.floor((new Date().getTime() - new Date(loan.updated_at).getTime()) / (1000 * 60 * 60 * 24)) <= 1;
      
      const paymentCount = Object.values(legacyPayments).filter(payment => payment > 0).length;
      const hasDataQualityIssues = loan.amount_returnable <= 0 || totalPaid < 0 || paymentCount === 0;
      
      const paymentFrequency = daysSinceLoan > 0 ? (paymentCount / Math.max(daysSinceLoan / 30, 1)) : 0;
      const averagePaymentAmount = paymentCount > 0 ? totalPaid / paymentCount : 0;
      
      const paymentDates = [
        { date: "30-05-2025", amount: loan["30-05-2025"] },
        { date: "31-05-2025", amount: loan["31-05-2025"] },
        { date: "02-06-2025", amount: loan["02-06-2025"] },
        { date: "04-06-2025", amount: loan["04-06-2025"] },
        { date: "05-06-2025", amount: loan["05-06-2025"] },
        { date: "07-06-2025", amount: loan["07-06-2025"] },
        { date: "10-06-2025", amount: loan["10-06-2025"] },
        { date: "11-06-2025", amount: loan["11-06-2025"] },
        { date: "12-06-2025", amount: loan["12-06-2025"] },
        { date: "13-06-2025", amount: loan["13-06-2025"] },
        { date: "14-06-2025", amount: loan["14-06-2025"] },
        { date: "16-06-2025", amount: loan["16-06-2025"] },
      ].filter(p => (p.amount || 0) > 0);
      
      const lastPaymentDate = paymentDates.length > 0 ? paymentDates[paymentDates.length - 1].date : null;
      const daysOverdue = loan.status === 'overdue' ? daysSinceLoan : 0;
      
      let riskTrend: 'improving' | 'stable' | 'deteriorating' = 'stable';
      if (collectionEfficiency > 80) riskTrend = 'improving';
      else if (collectionEfficiency < 30) riskTrend = 'deteriorating';

      // Calculate additional fields for DynamicLoanBookTable
      const calculatedRemainingBalance = Math.max(0, loan.amount_returnable - totalPaid);
      const calculatedProgress = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
      const dataQualityScore = hasDataQualityIssues ? 0 : 100;
      
      // Determine payment pattern
      let paymentPattern: 'regular' | 'irregular' | 'none' = 'none';
      if (paymentCount > 3) paymentPattern = 'regular';
      else if (paymentCount > 0) paymentPattern = 'irregular';
      
      // Calculate estimated completion date
      let estimatedCompletionDate: string | null = null;
      if (averagePaymentAmount > 0 && calculatedRemainingBalance > 0) {
        const monthsToComplete = Math.ceil(calculatedRemainingBalance / averagePaymentAmount);
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
        estimatedCompletionDate = completionDate.toISOString().split('T')[0];
      }
      
      // Determine confidence level
      let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
      if (paymentCount > 5 && collectionEfficiency > 60) confidenceLevel = 'high';
      else if (paymentCount > 2 && collectionEfficiency > 30) confidenceLevel = 'medium';
      
      // Calculate discrepancies
      const discrepancies: string[] = [];
      if (Math.abs(loan.remaining_balance - calculatedRemainingBalance) > 1) {
        discrepancies.push('Balance mismatch');
      }
      if (totalPaid > loan.amount_returnable) {
        discrepancies.push('Overpayment detected');
      }

      return {
        ...loan,
        ...legacyPayments,
        totalPaid,
        collectionEfficiency,
        collection_efficiency: collectionEfficiency, // Added for compatibility
        isCompleted,
        recentlyUpdated,
        hasDataQualityIssues,
        paymentFrequency,
        averagePaymentAmount,
        lastPaymentDate,
        daysOverdue,
        riskTrend,
        calculated_total_paid: totalPaid,
        calculated_remaining_balance: calculatedRemainingBalance,
        calculated_progress: calculatedProgress,
        data_quality_score: dataQualityScore,
        has_calculation_errors: hasDataQualityIssues,
        payment_pattern: paymentPattern,
        activePayments: paymentCount,
        estimated_completion_date: estimatedCompletionDate,
        confidence_level: confidenceLevel,
        discrepancies,
      };
    });

    const reliableLoans = smartLoans.filter(loan => !loan.hasDataQualityIssues);
    const totalLoans = smartLoans.length;
    const reliableCount = reliableLoans.length;
    const loansNeedingAttention = totalLoans - reliableCount;

    const reliableTotalPortfolio = reliableLoans.reduce((sum, loan) => sum + loan.amount_returnable, 0);
    const reliableTotalPaid = reliableLoans.reduce((sum, loan) => sum + loan.totalPaid, 0);
    const reliableTotalRemaining = reliableLoans.reduce((sum, loan) => sum + loan.remaining_balance, 0);
    const reliableCollectionRate = reliableTotalPortfolio > 0 ? (reliableTotalPaid / reliableTotalPortfolio) * 100 : 0;
    const averageCollectionEfficiency = reliableLoans.reduce((sum, loan) => sum + loan.collectionEfficiency, 0) / Math.max(reliableCount, 1);

    const hasDataQualityIssues = loansNeedingAttention > 0;
    const dataQualityScore = totalLoans > 0 ? (reliableCount / totalLoans) * 100 : 100;

    return {
      smartLoanData: smartLoans,
      portfolioMetrics: {
        total_loans: totalLoans,
        reliable_loans: reliableCount,
        loans_needing_attention: loansNeedingAttention,
        reliable_total_portfolio: reliableTotalPortfolio,
        reliable_total_paid: reliableTotalPaid,
        reliable_total_remaining: reliableTotalRemaining,
        reliable_collection_rate: reliableCollectionRate,
        average_collection_efficiency: averageCollectionEfficiency,
      },
      hasDataQualityIssues,
      dataQualityScore,
    };
  }, [rawLoanData]);
};
