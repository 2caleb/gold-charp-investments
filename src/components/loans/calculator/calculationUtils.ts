
import { InstallmentSchedule } from './types';

/**
 * Calculates loan installment details including monthly payment and amortization schedule
 */
export const calculateLoanInstallments = (
  amount: number,
  term: number,
  unit: 'days' | 'weeks' | 'months' | 'years',
  interestRate: number
): { 
  monthlyPayment: number, 
  totalInterest: number, 
  schedule: InstallmentSchedule 
} => {
  // Convert terms to months for calculation
  let termInMonths = term;
  if (unit === 'years') {
    termInMonths = term * 12;
  } else if (unit === 'weeks') {
    termInMonths = Math.ceil(term / 4.33);
  } else if (unit === 'days') {
    termInMonths = Math.ceil(term / 30);
  }

  // Convert annual rate to monthly
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate monthly payment (PMT formula)
  const payment = 
    amount * monthlyRate * Math.pow(1 + monthlyRate, termInMonths) / 
    (Math.pow(1 + monthlyRate, termInMonths) - 1);
  
  // Calculate amortization schedule
  const schedule: InstallmentSchedule = [];
  let balance = amount;
  let totalInterestPaid = 0;
  
  const today = new Date();
  
  for (let i = 1; i <= termInMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = payment - interestPayment;
    balance -= principalPayment;
    totalInterestPaid += interestPayment;
    
    // Calculate payment date
    const paymentDate = new Date(today);
    paymentDate.setMonth(today.getMonth() + i);
    
    // Prevent negative balance on final payment due to rounding
    const adjustedBalance = i === termInMonths ? 0 : Math.max(0, balance);
    
    schedule.push({
      date: paymentDate.toLocaleDateString(),
      payment: Number(payment.toFixed(2)),
      principal: Number(principalPayment.toFixed(2)),
      interest: Number(interestPayment.toFixed(2)),
      balance: Number(adjustedBalance.toFixed(2))
    });
  }

  return {
    monthlyPayment: payment,
    totalInterest: totalInterestPaid,
    schedule
  };
};

/**
 * Format number as UGX currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
