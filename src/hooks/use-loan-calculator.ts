
import { useState, useEffect } from 'react';

type LoanDuration = 'daily' | 'weekly' | 'monthly';

export interface LoanCalculation {
  principal: number;
  totalInterest: number;
  totalAmount: number;
  interestRate: number; // Annual interest rate as percentage
  payments: {
    number: number;
    principal: number;
    interest: number;
    total: number;
  }[];
}

// Helper functions to calculate loan details
const calculateInterest = (
  amount: number, 
  rate: number, 
  durationValue: number,
  durationType: LoanDuration
): LoanCalculation => {
  // Annual interest rate of 18%
  const annualRate = rate / 100;
  
  // Convert duration to relevant period
  let numberOfPeriods: number;
  let periodInterestRate: number;
  
  if (durationType === 'daily') {
    // For daily payments
    numberOfPeriods = durationValue;
    periodInterestRate = annualRate / 365;
  } else if (durationType === 'weekly') {
    // For weekly payments
    numberOfPeriods = durationValue;
    periodInterestRate = annualRate / 52;
  } else {
    // For monthly payments
    numberOfPeriods = durationValue;
    periodInterestRate = annualRate / 12;
  }
  
  // Simple interest calculation for now
  const totalInterest = amount * periodInterestRate * numberOfPeriods;
  const totalAmount = amount + totalInterest;
  
  // Generate payment schedule
  const payments = [];
  const paymentAmount = totalAmount / numberOfPeriods;
  
  for (let i = 1; i <= numberOfPeriods; i++) {
    // For simplicity, we'll divide the total interest evenly across all periods
    const paymentInterest = totalInterest / numberOfPeriods;
    const paymentPrincipal = amount / numberOfPeriods;
    
    payments.push({
      number: i,
      principal: parseFloat(paymentPrincipal.toFixed(2)),
      interest: parseFloat(paymentInterest.toFixed(2)),
      total: parseFloat(paymentAmount.toFixed(2))
    });
  }
  
  return {
    principal: amount,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    interestRate: rate,
    payments
  };
};

export const useLoanCalculator = (
  initialAmount: number = 0,
  durationValue: number = 1,
  durationType: LoanDuration = 'monthly',
  interestRate: number = 18 // Default 18% annual interest rate
) => {
  const [amount, setAmount] = useState(initialAmount);
  const [duration, setDuration] = useState(durationValue);
  const [paymentFrequency, setPaymentFrequency] = useState<LoanDuration>(durationType);
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  
  useEffect(() => {
    if (amount > 0 && duration > 0) {
      const result = calculateInterest(amount, interestRate, duration, paymentFrequency);
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [amount, duration, paymentFrequency, interestRate]);
  
  return {
    amount,
    setAmount,
    duration,
    setDuration,
    paymentFrequency,
    setPaymentFrequency,
    calculation,
    interestRate
  };
};
