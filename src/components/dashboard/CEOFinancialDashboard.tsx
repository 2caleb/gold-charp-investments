import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  BarChart3,
  Download,
  Calendar,
  Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  loanPortfolio: number;
  monthlyData: any[];
  expenseCategories: any[];
  incomeCategories: any[];
  loanPerformance: any[];
}

const CEOFinancialDashboard = () => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['ceo-financial-data'],
    queryFn: async (): Promise<FinancialData> => {
      // Fetch financial transactions
      const { data: transactions, error: transError } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transError) throw transError;

      // Fetch loan applications for portfolio data
      const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select('*');

      if (loansError) throw loansError;

      // Calculate metrics
      const totalIncome = transactions
        ?.filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalExpenses = transactions
        ?.filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const loanPortfolio = loans
        ?.filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + Number(l.loan_amount || 0), 0) || 0;

      const netProfit = totalIncome - totalExpenses;

      // Group data by month for charts
      const monthlyData = transactions?.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
          if (t.transaction_type === 'income') {
            existing.income += Number(t.amount);
          } else if (t.transaction_type === 'expense') {
            existing.expenses += Number(t.amount);
          }
        } else {
          acc.push({
            month,
            income: t.transaction_type === 'income' ? Number(t.amount) : 0,
            expenses: t.transaction_type === 'expense' ? Number(t.amount) : 0,
          });
        }
        return acc;
      }, [] as any[]) || [];

      // Group expenses by category
      const expenseCategories = transactions
        ?.filter(t => t.transaction_type === 'expense')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.category === t.category);
          if (existing) {
            existing.amount += Number(t.amount);
          } else {
            acc.push({ category: t.category, amount: Number(t.amount) });
          }
          return acc;
        }, [] as any[]) || [];

      // Group income by category
      const incomeCategories = transactions
        ?.filter(t => t.transaction_type === 'income')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.category === t.category);
          if (existing) {
            existing.amount += Number(t.amount);
          } else {
            acc.push({ category: t.category, amount: Number(t.amount) });
          }
          return acc;
        }, [] as any[]) || [];

      // Loan performance by status
      const loanPerformance = loans?.reduce((acc, loan) => {
        const existing = acc.find(item => item.status === loan.status);
        if (existing) {
          existing.count += 1;
          existing.amount += Number(loan.loan_amount || 0);
        } else {
          acc.push({
            status: loan.status,
            count: 1,
            amount: Number(loan.loan_amount || 0)
          });
        }
        return acc;
      }, [] as any[]) || [];

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        loanPortfolio,
        monthlyData,
        expenseCategories,
        incomeCategories,
        loanPerformance
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4 text-gray-400" />
            <p>Loading financial dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Income</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(financialData?.totalIncome || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(financialData?.totalExpenses || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Net Profit</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(financialData?.netProfit || 0)}
                </p>
                <Badge variant={financialData?.netProfit && financialData.netProfit > 0 ? "default" : "destructive"}>
                  {financialData?.netProfit && financialData.netProfit > 0 ? "Profitable" : "Loss"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Loan Portfolio</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(financialData?.loanPortfolio || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Monthly Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="income" fill="#22c55e" />
                <Bar dataKey="expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={financialData?.expenseCategories || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {financialData?.expenseCategories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Loan Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Loan Performance by Status
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Count</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Total Amount</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {financialData?.loanPerformance?.map((item, index) => {
                  const totalAmount = financialData.loanPerformance.reduce((sum, p) => sum + p.amount, 0);
                  const percentage = totalAmount > 0 ? (item.amount / totalAmount * 100).toFixed(1) : '0';
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge variant="outline" className="capitalize">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{item.count}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CEOFinancialDashboard;
