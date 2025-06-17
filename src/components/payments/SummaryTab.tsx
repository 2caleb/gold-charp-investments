
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyUtils';

interface SummaryTabProps {
  financialSummary?: {
    total_income?: number;
    total_expenses?: number;
    total_loan_portfolio?: number;
    total_repaid?: number;
    outstanding_balance?: number;
    collection_rate?: number;
    net_income?: number;
    active_loan_holders?: number;
    calculated_at?: string;
  };
}

const SummaryTab: React.FC<SummaryTabProps> = ({ financialSummary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Financial Summary (from financial_summary table)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Income:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(financialSummary?.total_income || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Expenses:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(financialSummary?.total_expenses || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Loan Portfolio:</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(financialSummary?.total_loan_portfolio || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Repaid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(financialSummary?.total_repaid || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Outstanding Balance:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(financialSummary?.outstanding_balance || 0)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span>Collection Rate:</span>
              <span className="font-semibold text-purple-600">
                {financialSummary?.collection_rate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Net Income:</span>
              <span className={`font-semibold ${
                (financialSummary?.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(financialSummary?.net_income || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Loan Holders:</span>
              <span className="font-semibold">
                {financialSummary?.active_loan_holders || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Data Source Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Data Source:</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                financial_summary table
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Calculated:</span>
              <span className="text-sm text-gray-600">
                {financialSummary?.calculated_at 
                  ? new Date(financialSummary.calculated_at).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Auto-sync:</span>
              <Badge variant="outline">
                Real-time updates enabled
              </Badge>
            </div>
            <div className="space-y-3 pt-4">
              <p className="text-xs text-gray-500">
                Edit the financial_summary table directly in Supabase to change these values
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryTab;
