
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InstallmentCalculatorProps, InstallmentSchedule } from './calculator/types';
import { calculateLoanInstallments } from './calculator/calculationUtils';
import SummaryCards from './calculator/SummaryCards';
import PaymentScheduleTable from './calculator/PaymentScheduleTable';

const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  amount,
  term,
  unit,
  loanAmount,
  duration,
  termUnit,
  interestRate,
  className = ''
}) => {
  // Use either new or old prop names
  const finalAmount = amount || loanAmount || 0;
  const finalTerm = term || duration || 12;
  const finalUnit = unit || termUnit || 'months';
  
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [schedule, setSchedule] = useState<InstallmentSchedule>([]);
  const [progressValue, setProgressValue] = useState<number>(0);

  useEffect(() => {
    if (finalAmount > 0 && finalTerm > 0) {
      const { monthlyPayment, totalInterest, schedule } = calculateLoanInstallments(
        finalAmount,
        finalTerm,
        finalUnit,
        interestRate
      );
      
      setMonthlyPayment(monthlyPayment);
      setTotalInterest(totalInterest);
      setSchedule(schedule);
      
      // Animate progress bar
      setTimeout(() => {
        setProgressValue(100);
      }, 300);
    }
  }, [finalAmount, finalTerm, finalUnit, interestRate]);

  if (!finalAmount || finalAmount <= 0) {
    return null;
  }

  return (
    <Card className={`mt-6 ${className}`}>
      <CardHeader>
        <CardTitle>Loan Repayment Schedule</CardTitle>
        <CardDescription>
          Estimated repayment plan based on {interestRate}% annual interest rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SummaryCards 
          monthlyPayment={monthlyPayment} 
          totalInterest={totalInterest} 
          totalAmount={finalAmount + totalInterest} 
        />
        
        <div className="mb-4">
          <Progress value={progressValue} className="h-2" />
        </div>
        
        <PaymentScheduleTable 
          schedule={schedule} 
          term={finalTerm} 
          unit={finalUnit} 
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant="outline" className="px-3 py-1">
          Interest Rate: {interestRate}%
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          {finalTerm} {finalUnit}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default InstallmentCalculator;
