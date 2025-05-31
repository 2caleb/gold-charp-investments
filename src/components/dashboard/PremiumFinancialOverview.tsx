
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinancialMetrics {
  totalExpenses: number;
  totalIncome: number;
  totalLoanAmount: number;
  totalRepaid: number;
  remainingBalance: number;
  activeLoanHolders: number;
  collectionRate: number;
  netIncome: number;
  expenseCategories: Array<{ category: string; amount: number }>;
}

const PremiumFinancialOverview = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['premium-financial-overview'],
    queryFn: async (): Promise<FinancialMetrics> => {
      try {
        // Fetch financial summary data first
        const { data: summaryData } = await supabase
          .from('financial_summary')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Fetch expense categories from financial_transactions
        const { data: transactions } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('transaction_type', 'expense');

        const expenseCategories = (transactions || [])
          .reduce((acc, transaction) => {
            const category = transaction.category || 'Other';
            const amount = parseFloat(transaction.amount?.toString() || '0');
            
            const existing = acc.find(item => item.category === category);
            if (existing) {
              existing.amount += amount;
            } else {
              acc.push({ category, amount });
            }
            return acc;
          }, [] as Array<{ category: string; amount: number }>)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        return {
          totalExpenses: summaryData?.total_expenses || 0,
          totalIncome: summaryData?.total_income || 0,
          totalLoanAmount: summaryData?.total_loan_portfolio || 0,
          totalRepaid: summaryData?.total_repaid || 0,
          remainingBalance: summaryData?.outstanding_balance || 0,
          activeLoanHolders: summaryData?.active_loan_holders || 0,
          collectionRate: summaryData?.collection_rate || 0,
          netIncome: summaryData?.net_income || 0,
          expenseCategories
        };
      } catch (error) {
        console.error('Error fetching financial metrics:', error);
        return {
          totalExpenses: 0,
          totalIncome: 0,
          totalLoanAmount: 0,
          totalRepaid: 0,
          remainingBalance: 0,
          activeLoanHolders: 0,
          collectionRate: 0,
          netIncome: 0,
          expenseCategories: []
        };
      }
    },
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Financial Metrics - Improved Grid and Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs lg:text-sm font-medium text-green-700">Total Income</p>
                  <p className="text-lg lg:text-xl font-bold text-green-900 truncate">
                    {formatCurrency(metrics?.totalIncome || 0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">From transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs lg:text-sm font-medium text-red-700">Total Expenses</p>
                  <p className="text-lg lg:text-xl font-bold text-red-900 truncate">
                    {formatCurrency(metrics?.totalExpenses || 0)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">From transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs lg:text-sm font-medium text-blue-700">Loan Portfolio</p>
                  <p className="text-lg lg:text-xl font-bold text-blue-900 truncate">
                    {formatCurrency(metrics?.totalLoanAmount || 0)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">From loan book</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <PiggyBank className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs lg:text-sm font-medium text-purple-700">Total Repaid</p>
                  <p className="text-lg lg:text-xl font-bold text-purple-900 truncate">
                    {formatCurrency(metrics?.totalRepaid || 0)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">From loan book</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights - Improved Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-3 h-5 w-5 text-gray-600 flex-shrink-0" />
              <span className="truncate">Loan Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-gray-600 min-w-0 flex-1">Active Loan Holders</span>
              <Badge variant="outline" className="font-semibold px-3 py-1 flex-shrink-0">
                {metrics?.activeLoanHolders || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-gray-600 min-w-0 flex-1">Collection Rate</span>
              <Badge 
                variant={metrics?.collectionRate >= 80 ? "default" : metrics?.collectionRate >= 60 ? "secondary" : "destructive"}
                className="font-semibold px-3 py-1 flex-shrink-0"
              >
                {metrics?.collectionRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-gray-600 min-w-0 flex-1">Outstanding Balance</span>
              <span className="font-semibold text-red-600 text-sm truncate flex-shrink-0">
                {formatCurrency(metrics?.remainingBalance || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-gray-600 min-w-0 flex-1">Net Income</span>
              <span className={`font-semibold text-sm truncate flex-shrink-0 ${metrics?.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(metrics?.netIncome || 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg truncate">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.expenseCategories.map((category, index) => (
                <div key={category.category} className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-600 capitalize min-w-0 flex-1 truncate">{category.category}</span>
                  <span className="font-semibold text-sm truncate flex-shrink-0">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
              {(!metrics?.expenseCategories || metrics.expenseCategories.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No expense categories found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumFinancialOverview;
