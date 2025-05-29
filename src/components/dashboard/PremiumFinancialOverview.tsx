
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
  totalRepaid: number;
  remainingBalance: number;
  activeLoanHolders: number;
  collectionRate: number;
  expenseCategories: Array<{ category: string; amount: number }>;
}

const PremiumFinancialOverview = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['premium-financial-overview'],
    queryFn: async (): Promise<FinancialMetrics> => {
      try {
        // Fetch all financial data in parallel
        const [expensesResponse, transactionsResponse, loanBookResponse] = await Promise.all([
          supabase.from('Expenses').select('*'),
          supabase.from('financial_transactions').select('*'),
          supabase.from('loan_book').select('*')
        ]);

        const expenses = expensesResponse.data || [];
        const transactions = transactionsResponse.data || [];
        const loanBook = loanBookResponse.data || [];

        // Calculate total expenses from financial_transactions table
        const totalExpenses = transactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        // Calculate total income from financial_transactions table
        const totalIncome = transactions
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        // Calculate loan portfolio metrics from loan_book table
        const totalLoanAmount = loanBook.reduce((sum, loan) => {
          const amount = parseFloat(loan.Amount_Returnable?.toString() || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const remainingBalance = loanBook.reduce((sum, loan) => {
          const balance = parseFloat(loan.Remaining_Balance?.toString() || '0');
          return sum + (isNaN(balance) ? 0 : balance);
        }, 0);

        // Calculate total repaid from loan_book payments
        const totalRepaid = loanBook.reduce((sum, loan) => {
          const payment1 = parseFloat(loan.Amount_Paid_1?.toString() || '0');
          const payment2 = parseFloat(loan.Amount_Paid_2?.toString() || '0');
          const payment3 = parseFloat(loan.Amount_paid_3?.toString() || '0');
          
          return sum + (isNaN(payment1) ? 0 : payment1) + 
                     (isNaN(payment2) ? 0 : payment2) + 
                     (isNaN(payment3) ? 0 : payment3);
        }, 0);

        // Calculate collection rate
        const collectionRate = totalLoanAmount > 0 
          ? ((totalRepaid / totalLoanAmount) * 100) 
          : 0;

        // Count active loan holders
        const activeLoanHolders = new Set(
          loanBook
            .filter(loan => parseFloat(loan.Remaining_Balance?.toString() || '0') > 0)
            .map(loan => loan.Name)
            .filter(Boolean)
        ).size;

        // Categorize expenses from financial_transactions
        const expenseCategories = transactions
          .filter(t => t.transaction_type === 'expense')
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
          totalExpenses,
          totalIncome,
          totalLoanAmount,
          totalRepaid,
          remainingBalance,
          activeLoanHolders,
          collectionRate,
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-8">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-green-700">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">
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
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-red-700">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">
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
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-blue-700">Loan Portfolio</p>
                  <p className="text-2xl font-bold text-blue-900">
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
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <PiggyBank className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-purple-700">Total Repaid</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(metrics?.totalRepaid || 0)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">From loan book</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-3 h-6 w-6 text-gray-600" />
              Loan Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Loan Holders</span>
              <Badge variant="outline" className="font-semibold text-base px-3 py-1">
                {metrics?.activeLoanHolders || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Collection Rate</span>
              <Badge 
                variant={metrics?.collectionRate >= 80 ? "default" : metrics?.collectionRate >= 60 ? "secondary" : "destructive"}
                className="font-semibold text-base px-3 py-1"
              >
                {metrics?.collectionRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Outstanding Balance</span>
              <span className="font-semibold text-red-600 text-base">
                {formatCurrency(metrics?.remainingBalance || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Income</span>
              <span className={`font-semibold text-base ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(netIncome))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.expenseCategories.map((category, index) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{category.category}</span>
                  <span className="font-semibold text-base">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
              {(!metrics?.expenseCategories || metrics.expenseCategories.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-6">
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
