
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallmentCalculatorProps {
  loanAmount?: string;
  loanTerm?: string;
  termUnit?: 'days' | 'weeks' | 'months' | 'years';
}

interface RepaymentScheduleItem {
  payment_number: number;
  payment_date: string;
  principal_payment: number;
  interest_payment: number;
  total_payment: number;
  remaining_balance: number;
}

const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  loanAmount: initialAmount = '',
  loanTerm: initialTerm = '12',
  termUnit: initialTermUnit = 'months'
}) => {
  const [loanAmount, setLoanAmount] = useState(initialAmount);
  const [loanTerm, setLoanTerm] = useState(initialTerm);
  const [termUnit, setTermUnit] = useState<'days' | 'weeks' | 'months' | 'years'>(initialTermUnit);
  const [interestRate, setInterestRate] = useState('15');
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentScheduleItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const { toast } = useToast();

  // Helper function to convert term to months
  const convertToMonths = (term: string, unit: 'days' | 'weeks' | 'months' | 'years'): number => {
    const numericTerm = parseInt(term);
    switch (unit) {
      case 'days':
        return Math.round(numericTerm / 30);
      case 'weeks':
        return Math.round(numericTerm / 4.33);
      case 'years':
        return numericTerm * 12;
      default:
        return numericTerm;
    }
  };

  // Calculate basic installment amount without using edge function
  useEffect(() => {
    if (!loanAmount || !loanTerm || parseFloat(loanAmount) <= 0 || parseInt(loanTerm) <= 0) {
      setMonthlyPayment(null);
      setTotalPayment(null);
      setTotalInterest(null);
      return;
    }

    const amount = parseFloat(loanAmount.replace(/,/g, ''));
    const months = convertToMonths(loanTerm, termUnit);
    const rate = parseFloat(interestRate) / 100 / 12;

    if (months > 0 && rate > 0) {
      const monthlyPaymentValue = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      const totalPaymentValue = monthlyPaymentValue * months;
      const totalInterestValue = totalPaymentValue - amount;

      setMonthlyPayment(monthlyPaymentValue);
      setTotalPayment(totalPaymentValue);
      setTotalInterest(totalInterestValue);
    }
  }, [loanAmount, loanTerm, termUnit, interestRate]);

  // Calculate detailed repayment schedule using edge function
  const calculateRepaymentSchedule = async () => {
    if (!loanAmount || !loanTerm || parseFloat(loanAmount.replace(/,/g, '')) <= 0 || parseInt(loanTerm) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid loan amount and term",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const amount = parseFloat(loanAmount.replace(/,/g, ''));
      const months = convertToMonths(loanTerm, termUnit);
      const rate = parseFloat(interestRate);
      
      const { data, error } = await supabase.rpc('calculate_repayment_schedule', {
        p_principal: amount,
        p_interest_rate: rate,
        p_term_months: months,
        p_start_date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      
      setRepaymentSchedule(data || []);
      setIsExpanded(true);
    } catch (error: any) {
      console.error('Error calculating repayment schedule:', error);
      toast({
        title: "Calculation failed",
        description: error.message || "Could not calculate repayment schedule",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-blue-500" />
          Loan Installment Calculator
        </CardTitle>
        <CardDescription>
          Calculate your monthly installments and view your repayment schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Loan Amount (UGX)</Label>
            <Input
              id="loan-amount"
              type="text"
              value={loanAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.,]/g, '');
                setLoanAmount(value);
              }}
              placeholder="e.g. 1,000,000"
              className="focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan Term</Label>
              <Input
                id="loan-term"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                min="1"
                className="focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="term-unit">Term Unit</Label>
              <Select value={termUnit} onValueChange={(value: 'days' | 'weeks' | 'months' | 'years') => setTermUnit(value)}>
                <SelectTrigger id="term-unit" className="focus:border-blue-500">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="interest-rate">Interest Rate (%): {interestRate}%</Label>
            </div>
            <Slider
              id="interest-rate"
              min={1}
              max={30}
              step={0.5}
              value={[parseFloat(interestRate)]}
              onValueChange={(values) => setInterestRate(values[0].toString())}
              className="py-4"
            />
          </div>

          {monthlyPayment && totalPayment && totalInterest && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</p>
                  <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {formatCurrency(monthlyPayment)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Payment</p>
                  <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {formatCurrency(totalPayment)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Interest</p>
                  <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {formatCurrency(totalInterest)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <Button 
            onClick={calculateRepaymentSchedule} 
            disabled={isCalculating || !loanAmount || !loanTerm} 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isCalculating ? "Calculating..." : "View Detailed Repayment Schedule"}
          </Button>

          <AnimatePresence>
            {isExpanded && repaymentSchedule.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 border rounded-md overflow-hidden"
              >
                <div className="p-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                  <h3 className="font-medium">Repayment Schedule</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repaymentSchedule.map((item) => (
                        <TableRow key={item.payment_number}>
                          <TableCell>{item.payment_number}</TableCell>
                          <TableCell>{new Date(item.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.principal_payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.interest_payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total_payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.remaining_balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentCalculator;
