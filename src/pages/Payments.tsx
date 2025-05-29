
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['payment-center-data'],
    queryFn: async () => {
      try {
        // Fetch from all financial tables
        const [expensesRes, transactionsRes, loanBookRes] = await Promise.all([
          supabase.from('Expenses').select('*'),
          supabase.from('financial_transactions').select('*'),
          supabase.from('loan_book').select('*')
        ]);

        return {
          expenses: expensesRes.data || [],
          transactions: transactionsRes.data || [],
          loanBook: loanBookRes.data || []
        };
      } catch (error) {
        console.error('Error fetching payment data:', error);
        return { expenses: [], transactions: [], loanBook: [] };
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <PremiumWelcomeSection />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Payment Center
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive financial management and payment tracking
              </p>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumFinancialOverview />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transactions">
                <CreditCard className="mr-2 h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <TrendingDown className="mr-2 h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="loan-book">
                <DollarSign className="mr-2 h-4 w-4" />
                Loan Book
              </TabsTrigger>
              <TabsTrigger value="reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Financial Transactions
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {paymentData?.transactions?.slice(0, 10).map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === 'income' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.transaction_type === 'income' ? 
                              <TrendingUp className="h-5 w-5" /> : 
                              <TrendingDown className="h-5 w-5" />
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500 capitalize">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.transaction_type === 'income' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="mr-2 h-5 w-5" />
                    Expense Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentData?.expenses?.slice(0, 10).map((expense, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{expense.Particulars}</p>
                          <p className="text-sm text-gray-500">Loan Holder: {expense.Loan_holders}</p>
                          <p className="text-sm text-gray-500">Account: {expense['Account 2']}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            {formatCurrency(expense.Amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {expense.Date ? new Date(expense.Date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loan-book" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Loan Book Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentData?.loanBook?.slice(0, 10).map((loan, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Client Name</p>
                            <p className="font-semibold text-gray-900">{loan.Name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Amount Returnable</p>
                            <p className="font-bold text-blue-600">
                              {formatCurrency(loan.Amount_Returnable)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Remaining Balance</p>
                            <p className="font-bold text-red-600">
                              {formatCurrency(loan.Remaining_Balance)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Payment Mode</p>
                            <Badge variant="outline" className="capitalize">
                              {loan.Payment_Mode || 'Not specified'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Payment 1: </span>
                            <span className="font-medium">{formatCurrency(loan.Amount_Paid_1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Payment 2: </span>
                            <span className="font-medium">{formatCurrency(loan.Amount_Paid_2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Payment 3: </span>
                            <span className="font-medium">{formatCurrency(loan.Amount_paid_3)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Transactions:</span>
                        <span className="font-semibold">{paymentData?.transactions?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses:</span>
                        <span className="font-semibold">{paymentData?.expenses?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Loans:</span>
                        <span className="font-semibold">{paymentData?.loanBook?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">Generate Monthly Report</Button>
                      <Button className="w-full" variant="outline">Export All Data</Button>
                      <Button className="w-full" variant="outline">Schedule Reports</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Payments;
