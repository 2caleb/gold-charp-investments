
import React from 'react';
import Layout from '@/components/layout/Layout';
import WeeklyReportsViewer from '@/components/reports/WeeklyReportsViewer';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Users,
  Download,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const ReportsPage: React.FC = () => {
  const { userRole, isLoading: roleLoading } = useRolePermissions();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports-data'],
    queryFn: async () => {
      try {
        const [summaryRes, transactionsRes, loanBookRes, expensesRes] = await Promise.all([
          supabase.from('financial_summary').select('*').order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('financial_transactions').select('*').order('date', { ascending: false }),
          supabase.from('loan_book').select('*'),
          supabase.from('Expenses').select('*').order('Date', { ascending: false })
        ]);

        return {
          summary: summaryRes.data,
          transactions: transactionsRes.data || [],
          loanBook: loanBookRes.data || [],
          expenses: expensesRes.data || []
        };
      } catch (error) {
        console.error('Error fetching reports data:', error);
        return { summary: null, transactions: [], loanBook: [], expenses: [] };
      }
    },
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(isNaN(numAmount) ? 0 : numAmount);
  };

  if (roleLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userRole || !['manager', 'director', 'chairperson', 'ceo'].includes(userRole)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">
                Financial reports are only available to Manager, Director, Chairperson, and CEO roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const summary = reportData?.summary;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Financial Reports Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive financial analysis and reporting</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-10">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 h-10">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Financial Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-700">Total Income</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(summary?.total_income || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-700">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(summary?.total_expenses || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-700">Loan Portfolio</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(summary?.total_loan_portfolio || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-700">Net Income</p>
                    <p className={`text-2xl font-bold ${(summary?.net_income || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {formatCurrency(summary?.net_income || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Detailed Reports Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Loan Performance Report */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
                Loan Performance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Loan Holders</span>
                  <Badge variant="outline" className="font-semibold">
                    {summary?.active_loan_holders || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <Badge 
                    variant={(summary?.collection_rate || 0) >= 80 ? "default" : "destructive"}
                    className="font-semibold"
                  >
                    {(summary?.collection_rate || 0).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outstanding Balance</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(summary?.outstanding_balance || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-gray-600">Total Repaid</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(summary?.total_repaid || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions Report */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-3 h-5 w-5 text-green-600" />
                Recent Financial Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData?.transactions?.slice(0, 5).map((transaction, index) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Reports Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <WeeklyReportsViewer />
        </motion.div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
