
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoanCalculation } from '@/hooks/use-loan-calculator';
import { formatCurrency } from "@/lib/utils";

interface LoanCalculationDisplayProps {
  calculation: LoanCalculation | null;
  durationType: 'daily' | 'weekly' | 'monthly';
}

const LoanCalculationDisplay: React.FC<LoanCalculationDisplayProps> = ({ 
  calculation,
  durationType
}) => {
  if (!calculation) return null;
  
  // Format the payment period based on frequency
  const getPaymentPeriod = (num: number) => {
    switch (durationType) {
      case 'daily':
        return `Day ${num}`;
      case 'weekly':
        return `Week ${num}`;
      case 'monthly':
        return `Month ${num}`;
      default:
        return `Period ${num}`;
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg">Loan Calculation Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-md">
            <div className="text-sm text-muted-foreground">Principal Amount</div>
            <div className="text-lg font-semibold">{formatCurrency(calculation.principal)}</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-md">
            <div className="text-sm text-muted-foreground">Total Interest (18% p.a.)</div>
            <div className="text-lg font-semibold">{formatCurrency(calculation.totalInterest)}</div>
          </div>
          <div className="p-4 bg-primary/10 rounded-md">
            <div className="text-sm text-primary-foreground">Total Repayment</div>
            <div className="text-lg font-semibold">{formatCurrency(calculation.totalAmount)}</div>
          </div>
        </div>
        
        {/* Only show payment schedule if there are payments */}
        {calculation.payments && calculation.payments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Payment Schedule</h4>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Only show up to 5 payments to avoid overwhelming the UI */}
                  {calculation.payments.slice(0, 5).map((payment) => (
                    <TableRow key={payment.number}>
                      <TableCell>{getPaymentPeriod(payment.number)}</TableCell>
                      <TableCell>{formatCurrency(payment.principal)}</TableCell>
                      <TableCell>{formatCurrency(payment.interest)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(payment.total)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* If there are more than 5 payments, add a summary row */}
                  {calculation.payments.length > 5 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        ... {calculation.payments.length - 5} more payments
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(calculation.totalAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Payment amounts are approximate and may vary slightly due to rounding.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanCalculationDisplay;
