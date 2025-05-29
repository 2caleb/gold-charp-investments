
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinancialMetrics {
  totalExpenses: number;
  totalIncome: number;
  totalLoanAmount: number;
  activeLoanHolders: number;
  remainingBalance: number;
  expenseCategories: Array<{ category: string; amount: number }>;
}

const PremiumFinancialOverview = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['financial-overview'],
    queryFn: async (): Promise<FinancialMetrics> => {
      try {
        // Fetch expenses data
        const { data: expenses } = await supabase
          .from('Expenses')
          .select('*');

        // Fetch financial transactions
        const { data: transactions } = await supabase
          .from('financial_transactions')
          .select('*');

        // Fetch loan book data
        const { data: loanBook } = await supabase
          .from('loan_book')
          .select('*');

        // Calculate metrics
        const totalExpenses = expenses?.reduce((sum, expense) => {
          const amount = parseFloat(expense.Amount?.toString() || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0) || 0;

        const totalIncome = transactions?.filter(t => t.transaction_type === 'income')
          .reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0) || 0;

        const totalLoanAmount = loanBook?.reduce((sum, loan) => {
          const amount = parseFloat(loan.Amount_Returnable?.toString() || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0) || 0;

        const remainingBalance = loanBook?.reduce((sum, loan) => {
          const balance = parseFloat(loan.Remaining_Balance?.toString() || '0');
          return sum + (isNaN(balance) ? 0 : balance);
        }, 0) || 0;

        const activeLoanHolders = new Set(expenses?.map(e => e.Loan_holders).filter(Boolean)).size;

        // Categorize expenses
        const expenseCategories = transactions?.filter(t => t.transaction_type === 'expense')
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
          }, [] as Array<{ category: string; amount: number }>) || [];

        return {
          totalExpenses,
          totalIncome,
          totalLoanAmount,
          activeLoanHolders,
          remainingBalance,
          expenseCategories: expenseCategories.slice(0, 5)
        };
      } catch (error) {
        console.error('Error fetching financial metrics:', error);
        return {
          totalExpenses: 0,
          totalIncome: 0,
          totalLoanAmount: 0,
          activeLoanHolders: 0,
          remainingBalance: 0,
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

  const netIncome = (metrics?.totalIncome || 0) - (metrics?.totalExpenses || 0);
  const collectionRate = metrics?.totalLoanAmount ? 
    ((metrics.totalLoanAmount - metrics.remainingBalance) / metrics.totalLoanAmount) * 100 : 0;

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
      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(metrics?.totalIncome || 0)}
                  </p>
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
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(metrics?.totalExpenses || 0)}
                  </p>
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
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Loan Portfolio</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(metrics?.totalLoanAmount || 0)}
                  </p>
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
          <Card className={`bg-gradient-to-br ${netIncome >= 0 ? 'from-purple-50 to-violet-100 border-purple-200' : 'from-orange-50 to-amber-100 border-orange-200'} hover:shadow-lg transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${netIncome >= 0 ? 'bg-purple-500' : 'bg-orange-500'} rounded-xl flex items-center justify-center`}>
                  {netIncome >= 0 ? 
                    <PiggyBank className="h-6 w-6 text-white" /> : 
                    <AlertCircle className="h-6 w-6 text-white" />
                  }
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${netIncome >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>
                    Net {netIncome >= 0 ? 'Profit' : 'Loss'}
                  </p>
                  <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-purple-900' : 'text-orange-900'}`}>
                    {formatCurrency(Math.abs(netIncome))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-gray-600" />
              Loan Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Loan Holders</span>
                <Badge variant="outline" className="font-semibold">
                  {metrics?.activeLoanHolders || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collection Rate</span>
                <Badge 
                  variant={collectionRate >= 80 ? "default" : collectionRate >= 60 ? "secondary" : "destructive"}
                  className="font-semibold"
                >
                  {collectionRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outstanding Balance</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(metrics?.remainingBalance || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
          <CardHeader>
            <CardTitle>Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.expenseCategories.map((category, index) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{category.category}</span>
                  <span className="font-semibold">
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
