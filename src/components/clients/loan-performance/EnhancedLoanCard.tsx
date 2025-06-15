import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Calculator,
  TrendingUp,
  TrendingDown,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartLoanData {
  id: string;
  client_name: string;
  amount_returnable: number;
  calculated_total_paid: number;
  calculated_remaining_balance: number;
  calculated_progress: number;
  data_quality_score: number;
  has_calculation_errors: boolean;
  discrepancies: string[];
  confidence_level: 'high' | 'medium' | 'low';
  payment_pattern: 'regular' | 'irregular' | 'declining' | 'accelerating';
  estimated_completion_date: string | null;
  collection_efficiency: number;
  activePayments: number[];
  recentlyUpdated: boolean;
  isCompleted: boolean;
  loan_date: string;
  status: string;
  payment_mode: string;
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  amount_paid_4: number;
  amount_paid_5: number;
  Amount_paid_6: number;
  Amount_paid_7: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical'; // <-- add 'critical'
  default_probability: number;
}

interface EnhancedLoanCardProps {
  loan: SmartLoanData;
  expandedLoanId: string | null;
  onToggleExpand: (loanId: string) => void;
}

const EnhancedLoanCard: React.FC<EnhancedLoanCardProps> = ({ loan, expandedLoanId, onToggleExpand }) => {
  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const getStatusIcon = (loan: SmartLoanData) => {
    if (loan.recentlyUpdated) return <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />;
    if (loan.has_calculation_errors) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (loan.status === 'completed' || loan.calculated_progress >= 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'accelerating': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'declining': return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'regular': return <Target className="h-3 w-3 text-blue-600" />;
      default: return <Calculator className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 space-y-4 transition-all duration-300 ${
        loan.recentlyUpdated ? 'border-yellow-300 bg-yellow-50 shadow-md' : 
        loan.has_calculation_errors ? 'border-red-300 bg-red-50' :
        'hover:bg-gray-50'
      }`}
    >
      {/* Header with Status and Quality Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(loan)}
          <div>
            <p className="font-medium">Loan from {new Date(loan.loan_date).toLocaleDateString()}</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-500">Payment Mode: {loan.payment_mode || 'Not specified'}</p>
              <Badge className={getConfidenceColor(loan.confidence_level)} variant="outline">
                {loan.confidence_level} confidence
              </Badge>
            </div>
            {loan.recentlyUpdated && (
              <p className="text-xs text-yellow-600 font-medium">⚡ Recently updated</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <Badge className={loan.calculated_progress >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
            {loan.status || 'Active'} {loan.calculated_progress >= 100 && '✓'}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            {getPatternIcon(loan.payment_pattern)}
            <span className="capitalize">{loan.payment_pattern}</span>
          </div>
        </div>
      </div>

      {/* Smart Calculation Alerts */}
      {loan.has_calculation_errors && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Data Quality Issues Detected</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {loan.discrepancies.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Financial Overview - Using Smart Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">Amount Returnable</p>
          <p className="font-bold text-lg">{formatCurrency(loan.amount_returnable || 0)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Total Paid 
            {loan.has_calculation_errors && <span className="text-red-500 ml-1">(Calculated)</span>}
          </p>
          <p className="font-bold text-lg text-green-600">{formatCurrency(loan.calculated_total_paid)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Remaining Balance
            {loan.has_calculation_errors && <span className="text-red-500 ml-1">(Calculated)</span>}
          </p>
          <p className="font-bold text-lg text-orange-600">{formatCurrency(loan.calculated_remaining_balance)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Risk Score</p>
          <Badge
            variant="outline"
            className={
              loan.risk_level === "low"
                ? "bg-green-50 text-green-700"
                : loan.risk_level === "medium"
                ? "bg-yellow-50 text-yellow-700"
                : loan.risk_level === "high"
                ? "bg-orange-50 text-orange-700"
                : loan.risk_level === "critical"
                ? "bg-red-50 text-red-700"
                : "bg-red-100 text-red-800"
            }
          >
            {loan.risk_score ? loan.risk_score : "N/A"}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500">Risk Level</p>
          <Badge
            variant="outline"
            className={
              loan.risk_level === "low"
                ? "bg-green-50 text-green-700"
                : loan.risk_level === "medium"
                ? "bg-yellow-50 text-yellow-700"
                : loan.risk_level === "high"
                ? "bg-orange-50 text-orange-700"
                : loan.risk_level === "critical"
                ? "bg-red-50 text-red-700"
                : "bg-red-100 text-red-800"
            }
          >
            {loan.risk_level}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500">Default Probability</p>
          <p className="font-semibold text-red-700">
            {loan.default_probability ? (loan.default_probability * 100).toFixed(0) + "%" : "N/A"}
          </p>
        </div>
      </div>

      {/* Smart Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Repayment Progress</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{loan.calculated_progress.toFixed(1)}%</span>
            <span className="text-xs text-gray-500">
              ({loan.collection_efficiency.toFixed(0)}% efficiency)
            </span>
          </div>
        </div>
        <Progress value={Math.min(loan.calculated_progress, 100)} className="h-3" />
        {loan.estimated_completion_date && loan.calculated_progress < 100 && (
          <p className="text-xs text-gray-500">
            Estimated completion: {new Date(loan.estimated_completion_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Enhanced Payment Breakdown */}
      {loan.activePayments.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Payment History</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Quality: {loan.data_quality_score.toFixed(0)}%
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(loan.id)}
              >
                {expandedLoanId === loan.id ? 'Collapse' : 'Expand'}
              </Button>
            </div>
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

export default EnhancedLoanCard;
