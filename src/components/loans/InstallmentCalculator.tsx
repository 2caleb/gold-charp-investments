
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from 'lucide-react';

interface InstallmentPlan {
  paymentNumber: number;
  date: string;
  principal: number;
  interest: number;
  payment: number;
  balance: number;
}

interface InstallmentCalculatorProps {
  initialAmount?: string;
  className?: string;
}

const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({ initialAmount = "", className = "" }) => {
  const [loanAmount, setLoanAmount] = useState(initialAmount);
  const [interestRate, setInterestRate] = useState("15");
  const [loanTerm, setLoanTerm] = useState("12");
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [termUnit, setTermUnit] = useState("months");

  useEffect(() => {
    // Update loan amount when initialAmount prop changes
    if (initialAmount) {
      setLoanAmount(initialAmount);
    }
  }, [initialAmount]);

  const calculateInstallments = () => {
    // Parse inputs
    const principal = parseFloat(loanAmount.replace(/,/g, ''));
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const term = parseInt(loanTerm); // Term in months
    
    if (isNaN(principal) || isNaN(rate) || isNaN(term) || principal <= 0 || term <= 0) {
      return;
    }
    
    // Calculate monthly payment using PMT formula
    const x = Math.pow(1 + rate, term);
    const monthly = (principal * x * rate) / (x - 1);
    setMonthlyPayment(monthly);
    
    // Calculate amortization schedule
    let balance = principal;
    const schedule: InstallmentPlan[] = [];
    const today = new Date();
    
    for (let i = 1; i <= term; i++) {
      // Calculate next payment date
      const nextDate = new Date(today);
      nextDate.setMonth(today.getMonth() + i);
      
      // Calculate interest and principal for this payment
      const interestPayment = balance * rate;
      let principalPayment = monthly - interestPayment;
      
      // Adjust for final payment
      if (i === term) {
        principalPayment = balance;
      }
      
      // Update balance
      balance -= principalPayment;
      if (balance < 0.01) balance = 0;
      
      // Add to schedule
      schedule.push({
        paymentNumber: i,
        date: nextDate.toLocaleDateString(),
        principal: principalPayment,
        interest: interestPayment,
        payment: principalPayment + interestPayment,
        balance: balance
      });
    }
    
    setInstallmentPlan(schedule);
    setShowTable(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calculator className="mr-2 h-5 w-5 text-purple-600" />
          Loan Installment Calculator
        </CardTitle>
        <CardDescription>
          Calculate your monthly payments and view full repayment schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="Enter loan amount"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
            <Input
              id="interestRate"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Enter interest rate"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="loanTerm">Loan Term</Label>
            <Input
              id="loanTerm"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="Enter loan term"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="termUnit">Term Unit</Label>
            <Select value={termUnit} onValueChange={setTermUnit}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={calculateInstallments}
          className="w-full bg-purple-700 hover:bg-purple-800 mb-6"
        >
          Calculate Installments
        </Button>

        {monthlyPayment !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md mb-6 text-center"
          >
            <h3 className="text-lg font-semibold mb-1">Monthly Payment</h3>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(monthlyPayment)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Payment: {formatCurrency(monthlyPayment * parseInt(loanTerm))}
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {showTable && installmentPlan.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <h3 className="font-medium mb-2">Repayment Schedule</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installmentPlan.map((payment) => (
                      <TableRow key={payment.paymentNumber}>
                        <TableCell>{payment.paymentNumber}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{formatCurrency(payment.principal)}</TableCell>
                        <TableCell>{formatCurrency(payment.interest)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.payment)}</TableCell>
                        <TableCell>{formatCurrency(payment.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default InstallmentCalculator;
