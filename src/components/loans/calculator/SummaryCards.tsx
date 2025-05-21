
import React from 'react';
import { formatCurrency } from './calculationUtils';

interface SummaryCardsProps {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  monthlyPayment, 
  totalInterest, 
  totalAmount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border text-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Payment</h3>
        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
          {formatCurrency(monthlyPayment)}
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border text-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Interest</h3>
        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
          {formatCurrency(totalInterest)}
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border text-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Payment</h3>
        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
          {formatCurrency(totalAmount)}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
