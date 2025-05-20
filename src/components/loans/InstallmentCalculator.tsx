
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InstallmentScheduleProps {
  loanAmount: number;
  duration: number;
  termUnit: 'days' | 'weeks' | 'months' | 'years';
  interestRate: number; // Annual interest rate in percentage
}

interface Installment {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
}

export const InstallmentCalculator: React.FC<InstallmentScheduleProps> = ({ 
  loanAmount, 
  duration, 
  termUnit, 
  interestRate = 15 // Default to 15% annual interest
}) => {
  const [installments, setInstallments] = useState<Installment[]>([]);

  useEffect(() => {
    if (!loanAmount || !duration) return;
    
    // Convert duration to months for calculation
    let durationInMonths = duration;
    switch(termUnit) {
      case 'days':
        durationInMonths = Math.ceil(duration / 30);
        break;
      case 'weeks':
        durationInMonths = Math.ceil((duration * 7) / 30);
        break;
      case 'months':
        // Already in months
        break;
      case 'years':
        durationInMonths = duration * 12;
        break;
    }

    // Calculate monthly interest rate
    const monthlyInterestRate = interestRate / 100 / 12;
    
    // Calculate monthly payment using PMT formula
    const monthlyPayment = 
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, durationInMonths)) / 
      (Math.pow(1 + monthlyInterestRate, durationInMonths) - 1);

    // Generate installment schedule
    const schedule: Installment[] = [];
    let remainingBalance = loanAmount;
    const today = new Date();
    
    for (let i = 1; i <= durationInMonths; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);
      
      const interest = remainingBalance * monthlyInterestRate;
      let principal = monthlyPayment - interest;
      
      // Handle last payment to ensure we don't end up with tiny remaining balance
      if (i === durationInMonths) {
        principal = remainingBalance;
      }
      
      remainingBalance -= principal;
      
      // Ensure we don't have negative remaining balance due to rounding
      if (remainingBalance < 0) remainingBalance = 0;
      
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toLocaleDateString(),
        principalAmount: parseFloat(principal.toFixed(2)),
        interestAmount: parseFloat(interest.toFixed(2)),
        totalAmount: parseFloat((principal + interest).toFixed(2)),
        remainingBalance: parseFloat(remainingBalance.toFixed(2))
      });
    }
    
    setInstallments(schedule);
  }, [loanAmount, duration, termUnit, interestRate]);

  if (!loanAmount || !duration) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mt-6 overflow-hidden border-t-4 border-t-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-800">
          <CardTitle className="flex items-center text-purple-800 dark:text-purple-300">
            <Calendar className="mr-2 h-5 w-5" />
            Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="w-[100px]">Payment #</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Total Payment</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow key={installment.installmentNumber}>
                    <TableCell className="font-medium">{installment.installmentNumber}</TableCell>
                    <TableCell>{installment.dueDate}</TableCell>
                    <TableCell>{installment.principalAmount.toLocaleString()} UGX</TableCell>
                    <TableCell>{installment.interestAmount.toLocaleString()} UGX</TableCell>
                    <TableCell className="font-semibold">{installment.totalAmount.toLocaleString()} UGX</TableCell>
                    <TableCell>{installment.remainingBalance.toLocaleString()} UGX</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InstallmentCalculator;
