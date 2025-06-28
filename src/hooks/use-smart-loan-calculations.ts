
import { useMemo } from 'react';
import { LoanBookLiveRecord, getPaymentDateColumns, getDateLabel, isValidDateColumn } from '@/types/loan-book-live-record';

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
  payment_pattern: 'regular' | 'irregular' | 'declining' | 'accelerating';
  activePayments: Array<{date: string, amount: number, label: string}>; // Updated to show actual dates
  estimated_completion_date: string | null;
  confidence_level: 'high' | 'medium' | 'low' | 'critical'; // Updated to match risk_level type
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
    console.log('Smart calculations received loan data:', rawLoanData?.length, rawLoanData?.[0]);

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

    const paymentDateColumns = getPaymentDateColumns();
    const smartLoans: SmartLoanData[] = rawLoanData.map((loan) => {
      console.log('Processing loan in calculations:', loan.client_name, loan);

      // Calculate total paid using ONLY non-null payment values
      const totalPaid = paymentDateColumns.reduce((sum, dateCol) => {
        const paymentAmount = (loan as any)[dateCol];
        // Only add to sum if the value is a valid number AND not null
        if (typeof paymentAmount === 'number' && paymentAmount !== null && paymentAmount > 0) {
          console.log(`Found payment for ${loan.client_name} on ${dateCol}: ${paymentAmount}`);
          return sum + paymentAmount;
        }
        return sum;
      }, 0);

      console.log(`Total paid for ${loan.client_name}: ${totalPaid}`);

      // Map first 12 date-based payments to legacy numbered format - preserve 0s for compatibility
      const legacyPayments = {
        amount_paid_1: (loan as any)[paymentDateColumns[0]] || 0,
        amount_paid_2: (loan as any)[paymentDateColumns[1]] || 0,
        amount_paid_3: (loan as any)[paymentDateColumns[2]] || 0,
        amount_paid_4: (loan as any)[paymentDateColumns[3]] || 0,
        amount_paid_5: (loan as any)[paymentDateColumns[4]] || 0,
        Amount_paid_6: (loan as any)[paymentDateColumns[5]] || 0,
        Amount_paid_7: (loan as any)[paymentDateColumns[6]] || 0,
        Amount_Paid_8: (loan as any)[paymentDateColumns[7]] || 0,
        Amount_Paid_9: (loan as any)[paymentDateColumns[8]] || 0,
        Amount_Paid_10: (loan as any)[paymentDateColumns[9]] || 0,
        Amount_Paid_11: (loan as any)[paymentDateColumns[10]] || 0,
        Amount_Paid_12: (loan as any)[paymentDateColumns[11]] || 0,
      };

      const collectionEfficiency = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
      const isCompleted = collectionEfficiency >= 100 || loan.status === 'completed';
      
      const loanDate = new Date(loan.loan_date);
      const daysSinceLoan = Math.floor((new Date().getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
      const recentlyUpdated = Math.floor((new Date().getTime() - new Date(loan.updated_at).getTime()) / (1000 * 60 * 60 * 24)) <= 1;
      
      // Create activePayments array with ONLY actual payments (non-null, non-zero)
      const activePayments = paymentDateColumns
        .map(dateCol => {
          const paymentAmount = (loan as any)[dateCol];
          // Only include payments with valid amounts > 0 AND not null
          if (typeof paymentAmount === 'number' && paymentAmount !== null && paymentAmount > 0 && isValidDateColumn(dateCol)) {
            return {
              date: dateCol,
              amount: paymentAmount,
              label: getDateLabel(dateCol)
            };
          }
          return null;
        })
        .filter((payment): payment is { date: string; amount: number; label: string } => payment !== null);
      
      console.log(`Active payments for ${loan.client_name}:`, activePayments);

      const paymentCount = activePayments.length;
      const hasDataQualityIssues = loan.amount_returnable <= 0 || totalPaid < 0;
      
      const paymentFrequency = daysSinceLoan > 0 ? (paymentCount / Math.max(daysSinceLoan / 30, 1)) : 0;
      const averagePaymentAmount = paymentCount > 0 ? totalPaid / paymentCount : 0;
      
      const lastPaymentDate = activePayments.length > 0 ? activePayments[activePayments.length - 1].date : null;
      const daysOverdue = loan.status === 'overdue' ? daysSinceLoan : 0;
      
      let riskTrend: 'improving' | 'stable' | 'deteriorating' = 'stable';
      if (collectionEfficiency > 80) riskTrend = 'improving';
      else if (collectionEfficiency < 30) riskTrend = 'deteriorating';

      // Calculate additional fields for DynamicLoanBookTable
      const calculatedRemainingBalance = Math.max(0, loan.amount_returnable - totalPaid);
      const calculatedProgress = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
      const dataQualityScore = hasDataQualityIssues ? 0 : (paymentCount > 0 ? 100 : 75);
      
      // Determine payment pattern with correct type
      let paymentPattern: 'regular' | 'irregular' | 'declining' | 'accelerating' = 'irregular';
      if (paymentCount > 3) {
        if (collectionEfficiency > 80) paymentPattern = 'accelerating';
        else paymentPattern = 'regular';
      } else if (paymentCount > 0) {
        if (collectionEfficiency < 30) paymentPattern = 'declining';
        else paymentPattern = 'irregular';
      }
      
      // Calculate estimated completion date
      let estimatedCompletionDate: string | null = null;
      if (averagePaymentAmount > 0 && calculatedRemainingBalance > 0) {
        const monthsToComplete = Math.ceil(calculatedRemainingBalance / averagePaymentAmount);
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
        estimatedCompletionDate = completionDate.toISOString().split('T')[0];
      }
      
      // Determine confidence level - updated to match risk_level type
      let confidenceLevel: 'high' | 'medium' | 'low' | 'critical' = 'low';
      if (paymentCount > 5 && collectionEfficiency > 60) confidenceLevel = 'high';
      else if (paymentCount > 2 && collectionEfficiency > 30) confidenceLevel = 'medium';
      else if (collectionEfficiency < 10 || paymentCount === 0) confidenceLevel = 'critical';
      
      // Calculate discrepancies
      const discrepancies: string[] = [];
      if (Math.abs(loan.remaining_balance - calculatedRemainingBalance) > 1) {
        discrepancies.push('Balance mismatch');
      }
      if (totalPaid > loan.amount_returnable) {
        discrepancies.push('Overpayment detected');
      }
      if (paymentCount === 0 && loan.amount_returnable > 0) {
        discrepancies.push('No payments recorded');
      }

      const smartLoan = {
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
        activePayments, // Now contains only actual payments with proper dates
        estimated_completion_date: estimatedCompletionDate,
        confidence_level: confidenceLevel,
        discrepancies,
      };

      console.log(`Smart loan processed for ${loan.client_name}:`, {
        totalPaid: smartLoan.totalPaid,
        activePayments: smartLoan.activePayments.length,
        collectionEfficiency: smartLoan.collectionEfficiency
      });

      return smartLoan;
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

    console.log('Final smart calculations result:', {
      totalLoans,
      reliableLoans: reliableCount,
      totalPaid: reliableTotalPaid
    });

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
