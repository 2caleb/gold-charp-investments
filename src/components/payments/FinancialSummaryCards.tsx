
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, PiggyBank, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyUtils';

interface FinancialSummaryCardsProps {
  financialSummary?: {
    total_income?: number;
    total_expenses?: number;
    total_loan_portfolio?: number;
    collection_rate?: number;
    net_income?: number;
    active_loan_holders?: number;
  };
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ financialSummary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Income</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(financialSummary?.total_income || 0)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                From financial_summary
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Total Expenses</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(financialSummary?.total_expenses || 0)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                From financial_summary
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Loan Portfolio</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(financialSummary?.total_loan_portfolio || 0)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {financialSummary?.collection_rate?.toFixed(1) || 0}% collection rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Net Income</p>
              <p className={`text-2xl font-bold ${
                (financialSummary?.net_income || 0) >= 0 
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                {formatCurrency(financialSummary?.net_income || 0)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {financialSummary?.active_loan_holders || 0} active loans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;
