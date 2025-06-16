
import { useMemo } from 'react';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';
import { LiveExpense } from './use-live-expenses-data';

interface MLInsights {
  riskPredictions: {
    loanId: string;
    clientName: string;
    defaultProbability: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  }[];
  expensePatterns: {
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    anomalies: number;
    predictedNext: number;
  }[];
  financialHealth: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    indicators: string[];
  };
  recommendations: string[];
}

export const useMLInsights = (loans: LoanBookLiveRecord[], expenses: LiveExpense[]): MLInsights => {
  return useMemo(() => {
    // Risk Prediction Algorithm
    const riskPredictions = loans.map(loan => {
      const totalPaid = (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + 
                       (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0);
      const paymentRate = totalPaid / (loan.amount_returnable || 1);
      const daysSinceLoan = Math.floor((Date.now() - new Date(loan.loan_date).getTime()) / (1000 * 60 * 60 * 24));
      
      let defaultProbability = 0;
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const factors: string[] = [];

      if (paymentRate < 0.25 && daysSinceLoan > 30) {
        defaultProbability += 0.4;
        factors.push('Low payment rate');
      }
      if (daysSinceLoan > 90 && paymentRate < 0.5) {
        defaultProbability += 0.3;
        factors.push('Extended payment period');
      }
      if (loan.remaining_balance > loan.amount_returnable * 0.8) {
        defaultProbability += 0.2;
        factors.push('High remaining balance');
      }

      if (defaultProbability > 0.7) riskLevel = 'critical';
      else if (defaultProbability > 0.5) riskLevel = 'high';
      else if (defaultProbability > 0.3) riskLevel = 'medium';

      return {
        loanId: loan.id,
        clientName: loan.client_name,
        defaultProbability: Math.min(defaultProbability, 1),
        riskLevel,
        factors
      };
    });

    // Expense Pattern Analysis
    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = [];
      acc[expense.category].push(expense);
      return acc;
    }, {} as Record<string, LiveExpense[]>);

    const expensePatterns = Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
      const sortedExpenses = categoryExpenses.sort((a, b) => 
        new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime()
      );
      
      const recentExpenses = sortedExpenses.slice(-10);
      const amounts = recentExpenses.map(e => e.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (amounts.length > 1) {
        const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
        const secondHalf = amounts.slice(Math.floor(amounts.length / 2));
        const firstAvg = firstHalf.reduce((sum, amt) => sum + amt, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, amt) => sum + amt, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) trend = 'increasing';
        else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
      }

      const anomalies = amounts.filter(amt => Math.abs(amt - avgAmount) > avgAmount * 0.5).length;
      const predictedNext = trend === 'increasing' ? avgAmount * 1.1 : 
                           trend === 'decreasing' ? avgAmount * 0.9 : avgAmount;

      return { category, trend, anomalies, predictedNext };
    });

    // Financial Health Score
    const totalLoanPortfolio = loans.reduce((sum, loan) => sum + (loan.amount_returnable || 0), 0);
    const totalPaid = loans.reduce((sum, loan) => 
      sum + (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + 
      (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0), 0
    );
    const collectionRate = totalLoanPortfolio > 0 ? (totalPaid / totalLoanPortfolio) * 100 : 0;
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseToIncomeRatio = totalLoanPortfolio > 0 ? (totalExpenses / totalPaid) * 100 : 0;
    
    let score = 100;
    const indicators: string[] = [];
    
    if (collectionRate < 50) {
      score -= 30;
      indicators.push('Low collection rate');
    }
    if (expenseToIncomeRatio > 80) {
      score -= 20;
      indicators.push('High expense ratio');
    }
    if (riskPredictions.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length > loans.length * 0.2) {
      score -= 25;
      indicators.push('High-risk loans');
    }
    
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    // Smart Recommendations
    const recommendations: string[] = [];
    if (collectionRate < 70) {
      recommendations.push('Implement stricter collection policies and follow-up procedures');
    }
    if (riskPredictions.filter(r => r.riskLevel === 'critical').length > 0) {
      recommendations.push('Immediate intervention required for critical risk loans');
    }
    if (expensePatterns.filter(p => p.trend === 'increasing').length > expensePatterns.length * 0.5) {
      recommendations.push('Review and optimize increasing expense categories');
    }
    if (totalExpenses > totalPaid * 0.7) {
      recommendations.push('Consider expense reduction strategies to improve profitability');
    }

    return {
      riskPredictions,
      expensePatterns,
      financialHealth: { score: Math.max(score, 0), grade, indicators },
      recommendations
    };
  }, [loans, expenses]);
};
