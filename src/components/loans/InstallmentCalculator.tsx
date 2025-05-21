
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface InstallmentCalculatorProps {
  // Support both old and new prop names for backward compatibility
  amount?: number;
  term?: number;
  unit?: 'days' | 'weeks' | 'months' | 'years';
  loanAmount?: number;
  duration?: number;
  termUnit?: 'days' | 'weeks' | 'months' | 'years';
  interestRate: number;
}

type InstallmentSchedule = {
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}[];

const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  amount,
  term,
  unit,
  loanAmount,
  duration,
  termUnit,
  interestRate
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
      calculateLoan();
    }
  }, [finalAmount, finalTerm, finalUnit, interestRate]);

  const calculateLoan = () => {
    // Convert terms to months for calculation
    let termInMonths = finalTerm;
    if (finalUnit === 'years') {
      termInMonths = finalTerm * 12;
    } else if (finalUnit === 'weeks') {
      termInMonths = Math.ceil(finalTerm / 4.33);
    } else if (finalUnit === 'days') {
      termInMonths = Math.ceil(finalTerm / 30);
    }

    // Convert annual rate to monthly
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate monthly payment (PMT formula)
    const payment = 
      finalAmount * monthlyRate * Math.pow(1 + monthlyRate, termInMonths) / 
      (Math.pow(1 + monthlyRate, termInMonths) - 1);
    
    setMonthlyPayment(payment);
    
    // Calculate amortization schedule
    const newSchedule: InstallmentSchedule = [];
    let balance = finalAmount;
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
      
      newSchedule.push({
        date: paymentDate.toLocaleDateString(),
        payment: Number(payment.toFixed(2)),
        principal: Number(principalPayment.toFixed(2)),
        interest: Number(interestPayment.toFixed(2)),
        balance: Number(adjustedBalance.toFixed(2))
      });
    }
    
    setTotalInterest(totalInterestPaid);
    setSchedule(newSchedule);
    
    // Animate progress bar
    setTimeout(() => {
      setProgressValue(100);
    }, 300);
  };

  if (!finalAmount || finalAmount <= 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Loan Repayment Schedule</CardTitle>
        <CardDescription>
          Estimated repayment plan based on {interestRate}% annual interest rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Payment</h3>
            <p className="text-2xl font-bold text-purple-700">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UGX',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(monthlyPayment)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Interest</h3>
            <p className="text-2xl font-bold text-purple-700">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UGX',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(totalInterest)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Payment</h3>
            <p className="text-2xl font-bold text-purple-700">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UGX',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(finalAmount + totalInterest)}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <Progress value={progressValue} className="h-2" />
        </div>
        
        <Table>
          <TableCaption>Payment schedule for {finalTerm} {finalUnit}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Date</TableHead>
              <TableHead>Payment Amount</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Remaining Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.slice(0, 6).map((payment, index) => (
              <TableRow key={index}>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.payment.toLocaleString()}</TableCell>
                <TableCell>{payment.principal.toLocaleString()}</TableCell>
                <TableCell>{payment.interest.toLocaleString()}</TableCell>
                <TableCell>{payment.balance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {schedule.length > 6 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center italic text-muted-foreground">
                  ... {schedule.length - 6} more payments
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
