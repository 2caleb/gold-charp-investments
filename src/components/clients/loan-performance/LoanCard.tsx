
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoanData {
  id: string;
  client_name: string;
  amount_returnable: number;
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  amount_paid_4: number;
  amount_paid_5: number;
  Amount_paid_6: number;
  Amount_paid_7: number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
  totalPaid: number;
  progress: number;
  activePayments: number[];
  recentlyUpdated: boolean;
  isCompleted: boolean;
}

interface LoanCardProps {
  loan: LoanData;
  expandedLoanId: string | null;
  onToggleExpand: (loanId: string) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, expandedLoanId, onToggleExpand }) => {
  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const getStatusIcon = (status: string, progress: number, recentlyUpdated: boolean) => {
    if (recentlyUpdated) return <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />;
    if (status === 'completed' || progress >= 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'overdue') return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getStatusColor = (status: string, progress: number, recentlyUpdated: boolean) => {
    if (recentlyUpdated) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status === 'completed' || progress >= 100) return 'bg-green-100 text-green-800';
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 space-y-4 transition-all duration-300 ${
        loan.recentlyUpdated ? 'border-yellow-300 bg-yellow-50 shadow-md' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(loan.status, loan.progress, loan.recentlyUpdated)}
          <div>
            <p className="font-medium">Loan from {new Date(loan.loan_date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Payment Mode: {loan.payment_mode || 'Not specified'}</p>
            {loan.recentlyUpdated && (
              <p className="text-xs text-yellow-600 font-medium">⚡ Recently updated</p>
            )}
          </div>
        </div>
        <Badge className={getStatusColor(loan.status, loan.progress, loan.recentlyUpdated)}>
          {loan.status || 'Active'} {loan.progress >= 100 && '✓'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Amount Returnable</p>
          <p className="font-bold text-lg">{formatCurrency(loan.amount_returnable || 0)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="font-bold text-lg text-green-600">{formatCurrency(loan.totalPaid)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Remaining Balance</p>
          <p className="font-bold text-lg text-orange-600">{formatCurrency(loan.remaining_balance || 0)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Repayment Progress</span>
          <span className="text-sm font-medium">{loan.progress.toFixed(1)}%</span>
        </div>
        <Progress value={Math.min(loan.progress, 100)} className="h-3" />
      </div>

      {/* Smart Payment Breakdown - Only show active payments */}
      {loan.activePayments.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Payment History</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(loan.id)}
            >
              {expandedLoanId === loan.id ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          
          <AnimatePresence>
            {expandedLoanId === loan.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                {loan.activePayments.map((paymentIndex) => {
                  const paymentKey = `amount_paid_${paymentIndex}` as keyof typeof loan;
                  const amount = paymentIndex === 6 ? loan.Amount_paid_6 : 
                               paymentIndex === 7 ? loan.Amount_paid_7 : 
                               loan[paymentKey] as number;
                  
                  return (
                    <div key={paymentIndex} className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Payment {paymentIndex}</p>
                      <p className="text-sm font-medium">{formatCurrency(amount || 0)}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default LoanCard;
