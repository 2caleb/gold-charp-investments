
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search,
  Filter,
  Download,
  Plus,
  PiggyBank,
  BarChart3,
  AlertCircle
} from 'lucide-react';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');

  // Fetch financial summary data
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching financial summary:', error);
        return null;
      }
      return data;
    },
  });

  // Fetch loan book data
  const { data: loanBookData, isLoading: loanBookLoading } = useQuery({
    queryKey: ['loan-book'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_book')
        .select('*');
      
      if (error) {
        console.error('Error fetching loan book:', error);
        return [];
      }
      return data || [];
    },
  });

  // Fetch expenses data
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Expenses')
        .select('*');
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      return data || [];
    },
  });

  // Fetch transactions data
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data || [];
    },
  });

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return 'UGX 0';
    
    let numAmount: number;
    if (typeof amount === 'string') {
      // Remove commas and convert to number
      numAmount = parseFloat(amount.replace(/,/g, ''));
    } else {
      numAmount = amount;
    }
    
    if (isNaN(numAmount)) return 'UGX 0';
    
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const filteredLoanBook = loanBookData?.filter(loan => 
    loan.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
  ) || [];

  const filteredExpenses = expensesData?.filter(expense => 
    expense.Loan_holders?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
    expense.particulars?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) || ''
  ) || [];

  const isLoading = summaryLoading || loanBookLoading || expensesLoading || transactionsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="animate-pulse p-8">
            <div className="h-24 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <PremiumWelcomeSection />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Payment Center
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive financial management and payment tracking powered by real data
              </p>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 px-4 shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </motion.div>

        {/* Financial Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-700">Total Loan Portfolio</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(summaryData?.total_loan_portfolio || 0)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">From loan book</p>
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
                    <p className="text-sm font-medium text-green-700">Total Repaid</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(summaryData?.total_repaid || 0)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {summaryData?.collection_rate?.toFixed(1) || 0}% collection rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-700">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(summaryData?.outstanding_balance || 0)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">Remaining to collect</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumFinancialOverview />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="loan-book" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="loan-book" className="text-sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Loan Book
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-sm">
                <TrendingDown className="mr-2 h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="loan-book" className="space-y-6 mt-6">
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="flex items-center text-lg">
                      <DollarSign className="mr-3 h-5 w-5" />
                      Loan Book Management ({filteredLoanBook.length} records)
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
                        placeholder="Search by client name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Amount Returnable</TableHead>
                          <TableHead>Amount Paid 1</TableHead>
                          <TableHead>Amount Paid 2</TableHead>
                          <TableHead>Amount Paid 3</TableHead>
                          <TableHead>Remaining Balance</TableHead>
                          <TableHead>Payment Mode</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLoanBook.length > 0 ? (
                          filteredLoanBook.map((loan, index) => (
                            <TableRow key={loan.Date + index}>
                              <TableCell className="font-medium">{loan.Name || 'N/A'}</TableCell>
                              <TableCell className="text-blue-600 font-semibold">
                                {formatCurrency(loan.Amount_Returnable)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(loan.Amount_Paid_1)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(loan.Amount_Paid_2)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(loan.Amount_paid_3)}
                              </TableCell>
                              <TableCell className="text-red-600 font-semibold">
                                {formatCurrency(loan.Remaining_Balance)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{loan.Payment_Mode || 'Not specified'}</Badge>
                              </TableCell>
                              <TableCell>{loan.Date || 'N/A'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="h-8 w-8 text-gray-400" />
                                <p className="text-gray-500">
                                  {loanBookData && loanBookData.length === 0 ? 'No loan records available' : 'No records match your search'}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Financial Transactions ({transactionsData?.length || 0} records)
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
                  <div className="space-y-4">
                    {transactionsData && transactionsData.length > 0 ? (
                      transactionsData.slice(0, 10).map((transaction, index) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No transaction records available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <TrendingDown className="mr-2 h-5 w-5" />
                      Expense Management ({filteredExpenses.length} records)
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
                        placeholder="Search expenses..."
                        value={expenseSearchTerm}
                        onChange={(e) => setExpenseSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loan Holder</TableHead>
                          <TableHead>Particulars</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Loan Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.length > 0 ? (
                          filteredExpenses.map((expense, index) => (
                            <TableRow key={expense.Loan_holders + index}>
                              <TableCell className="font-medium">{expense.Loan_holders || 'N/A'}</TableCell>
                              <TableCell>{expense.particulars || 'N/A'}</TableCell>
                              <TableCell className="text-red-600 font-semibold">
                                {formatCurrency(expense.amount)}
                              </TableCell>
                              <TableCell>
                                {expense.date ? new Date(expense.date).toLocaleDateString() : expense.date_2 || 'N/A'}
                              </TableCell>
                              <TableCell>{expense.account_2 || 'N/A'}</TableCell>
                              <TableCell className="text-blue-600">
                                {formatCurrency(expense.loan_amount)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="h-8 w-8 text-gray-400" />
                                <p className="text-gray-500">
                                  {expensesData && expensesData.length === 0 ? 'No expense records available' : 'No records match your search'}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Active Loans:</span>
                        <span className="font-semibold">{summaryData?.active_loan_holders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Portfolio Value:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(summaryData?.total_loan_portfolio || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Repaid:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(summaryData?.total_repaid || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outstanding Balance:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(summaryData?.outstanding_balance || 0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span>Collection Rate:</span>
                        <span className="font-semibold text-purple-600">
                          {summaryData?.collection_rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full h-10" variant="outline">Generate Loan Book Report</Button>
                      <Button className="w-full h-10" variant="outline">Export Payment History</Button>
                      <Button className="w-full h-10" variant="outline">Schedule Collection Reports</Button>
                      <Button className="w-full h-10" variant="outline">Generate Financial Summary</Button>
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
