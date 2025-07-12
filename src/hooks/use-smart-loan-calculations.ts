
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
  activePayments: Array<{date: string, amount: number, label: string, hasPayment: boolean}>; // Enhanced with hasPayment flag
  allPaymentDates: Array<{date: string, amount: number, label: string, hasPayment: boolean}>; // All dates including empty ones
  estimated_completion_date: string | null;
  confidence_level: 'high' | 'medium' | 'low' | 'critical'; // Updated to match risk_level type
  discrepancies: string[];
  paymentCompleteness: number; // Percentage of expected payments made
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

    // Get payment columns dynamically from the actual data
    const paymentDateColumns = getPaymentDateColumns(rawLoanData);
    console.log('Dynamic payment columns detected:', paymentDateColumns);
    
    const smartLoans: SmartLoanData[] = rawLoanData.map((loan) => {
      console.log('Processing loan in calculations:', loan.client_name, loan);

      // Calculate total paid using ONLY valid payment values (enhanced null handling)
      const totalPaid = paymentDateColumns.reduce((sum, dateCol) => {
        const paymentAmount = (loan as any)[dateCol];
        // Enhanced null handling for all possible null representations
        const isValidPayment = paymentAmount !== null && 
                              paymentAmount !== undefined && 
                              paymentAmount !== '<nil>' &&
                              paymentAmount !== 'null' &&
                              paymentAmount !== 'NULL' &&
                              paymentAmount !== '' &&
                              paymentAmount !== 0 &&
                              typeof paymentAmount === 'number' && 
                              !isNaN(paymentAmount) &&
                              paymentAmount > 0;
        
        if (isValidPayment) {
          console.log(`Found payment for ${loan.client_name} on ${dateCol}: ${paymentAmount}`);
          return sum + paymentAmount;
        }
        return sum;
      }, 0);

      console.log(`Total paid for ${loan.client_name}: ${totalPaid}`);

      // Map first 12 date-based payments to legacy numbered format with null value processing
      const processPaymentValue = (value: any): number => {
        if (value === null || value === undefined || value === '<nil>' || 
            value === 'null' || value === 'NULL' || value === '' || isNaN(value)) {
          return 0;
        }
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      };

      const legacyPayments = {
        amount_paid_1: processPaymentValue((loan as any)[paymentDateColumns[0]]),
        amount_paid_2: processPaymentValue((loan as any)[paymentDateColumns[1]]),
        amount_paid_3: processPaymentValue((loan as any)[paymentDateColumns[2]]),
        amount_paid_4: processPaymentValue((loan as any)[paymentDateColumns[3]]),
        amount_paid_5: processPaymentValue((loan as any)[paymentDateColumns[4]]),
        Amount_paid_6: processPaymentValue((loan as any)[paymentDateColumns[5]]),
        Amount_paid_7: processPaymentValue((loan as any)[paymentDateColumns[6]]),
        Amount_Paid_8: processPaymentValue((loan as any)[paymentDateColumns[7]]),
        Amount_Paid_9: processPaymentValue((loan as any)[paymentDateColumns[8]]),
        Amount_Paid_10: processPaymentValue((loan as any)[paymentDateColumns[9]]),
        Amount_Paid_11: processPaymentValue((loan as any)[paymentDateColumns[10]]),
        Amount_Paid_12: processPaymentValue((loan as any)[paymentDateColumns[11]]),
      };

      const collectionEfficiency = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
      const isCompleted = collectionEfficiency >= 100 || loan.status === 'completed';
      
      const loanDate = new Date(loan.loan_date);
      const daysSinceLoan = Math.floor((new Date().getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
      const recentlyUpdated = Math.floor((new Date().getTime() - new Date(loan.updated_at).getTime()) / (1000 * 60 * 60 * 24)) <= 1;
      
      // Create activePayments array with ALL payment dates and proper null handling
      const activePayments = paymentDateColumns
        .map(dateCol => {
          const paymentAmount = (loan as any)[dateCol];
          const processedAmount = processPaymentValue(paymentAmount);
          
          // Include ALL valid date columns with their processed values
          if (isValidDateColumn(dateCol)) {
            return {
              date: dateCol,
              amount: processedAmount,
              label: getDateLabel(dateCol),
              hasPayment: processedAmount > 0
            };
          }
          return null;
        })
        .filter((payment): payment is { date: string; amount: number; label: string; hasPayment: boolean } => payment !== null);
      
      console.log(`All payment dates for ${loan.client_name}:`, activePayments);

      // Calculate payment completeness and actual payment count
      const actualPaymentCount = activePayments.filter(p => p.hasPayment).length;
      const paymentCompleteness = paymentDateColumns.length > 0 ? 
        (actualPaymentCount / paymentDateColumns.length) * 100 : 0;
      const hasDataQualityIssues = loan.amount_returnable <= 0 || totalPaid < 0;
      
      const paymentFrequency = daysSinceLoan > 0 ? (actualPaymentCount / Math.max(daysSinceLoan / 30, 1)) : 0;
      const averagePaymentAmount = actualPaymentCount > 0 ? totalPaid / actualPaymentCount : 0;
      
      // Find the last actual payment date
      const lastPaymentDate = activePayments.filter(p => p.hasPayment).length > 0 ? 
        activePayments.filter(p => p.hasPayment).slice(-1)[0].date : null;
      const daysOverdue = loan.status === 'overdue' ? daysSinceLoan : 0;
      
      let riskTrend: 'improving' | 'stable' | 'deteriorating' = 'stable';
      if (collectionEfficiency > 80) riskTrend = 'improving';
      else if (collectionEfficiency < 30) riskTrend = 'deteriorating';

      // Calculate additional fields for DynamicLoanBookTable
      const calculatedRemainingBalance = Math.max(0, loan.amount_returnable - totalPaid);
      const calculatedProgress = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
      const dataQualityScore = hasDataQualityIssues ? 0 : (actualPaymentCount > 0 ? 100 : 75);
      
      // Determine payment pattern with correct type
      let paymentPattern: 'regular' | 'irregular' | 'declining' | 'accelerating' = 'irregular';
      if (actualPaymentCount > 3) {
        if (collectionEfficiency > 80) paymentPattern = 'accelerating';
        else paymentPattern = 'regular';
      } else if (actualPaymentCount > 0) {
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
      if (actualPaymentCount > 5 && collectionEfficiency > 60) confidenceLevel = 'high';
      else if (actualPaymentCount > 2 && collectionEfficiency > 30) confidenceLevel = 'medium';
      else if (collectionEfficiency < 10 || actualPaymentCount === 0) confidenceLevel = 'critical';
      
      // Calculate discrepancies
      const discrepancies: string[] = [];
      if (Math.abs(loan.remaining_balance - calculatedRemainingBalance) > 1) {
        discrepancies.push('Balance mismatch');
      }
      if (totalPaid > loan.amount_returnable) {
        discrepancies.push('Overpayment detected');
      }
      if (actualPaymentCount === 0 && loan.amount_returnable > 0) {
        discrepancies.push('No payments recorded');
      }
      if (paymentCompleteness < 50 && loan.amount_returnable > 0) {
        discrepancies.push('Low payment frequency');
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
        activePayments: activePayments.filter(p => p.hasPayment), // Only actual payments
        allPaymentDates: activePayments, // All dates including empty ones
        estimated_completion_date: estimatedCompletionDate,
        confidence_level: confidenceLevel,
        discrepancies,
        paymentCompleteness,
      };

      console.log(`Smart loan processed for ${loan.client_name}:`, {
        totalPaid: smartLoan.totalPaid,
        actualPayments: smartLoan.activePayments.length,
        allPaymentDates: smartLoan.allPaymentDates.length,
        paymentCompleteness: smartLoan.paymentCompleteness,
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
