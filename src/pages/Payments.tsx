import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import TransactionEditor from '@/components/transactions/TransactionEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
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
  AlertCircle,
  Send
} from 'lucide-react';
import { useFinancialSummaryQuery } from '@/hooks/use-financial-summary-query';
import { exportLoanBookToExcel, exportExpensesToExcel } from '@/utils/excelExportUtils';
import DynamicLoanBookTable from '@/components/payments/DynamicLoanBookTable';
import { adaptLoanRecordToLegacy } from '@/types/loan-book-adapter';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [isExportingLoanBook, setIsExportingLoanBook] = useState(false);
  const [isExportingExpenses, setIsExportingExpenses] = useState(false);
  const { toast } = useToast();

  // Use simplified financial summary query
  const { data: financialSummary, isLoading: summaryLoading, refetch: refetchSummary } = useFinancialSummaryQuery();

  // Fetch loan book live data
  const { data: rawLoanBookData, isLoading: loanBookLoading, refetch: refetchLoanBook } = useQuery({
    queryKey: ['loan-book-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching loan book live:', error);
        return [];
      }
      return data || [];
    },
  });

  // Fetch expenses live data
  const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
    queryKey: ['expenses-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses_live')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses live:', error);
        return [];
      }
      return data || [];
    },
  });

  // Set up real-time subscriptions for loan book and expenses only
  useEffect(() => {
    const loanBookChannel = supabase
      .channel('loan_book_live_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_book_live' }, () => {
        refetchLoanBook();
      })
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses_live_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses_live' }, () => {
        refetchExpenses();
      })
      .subscribe();

    const summaryChannel = supabase
      .channel('financial_summary_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_summary' }, () => {
        refetchSummary();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(loanBookChannel);
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(summaryChannel);
    };
  }, [refetchLoanBook, refetchExpenses, refetchSummary]);

  // Convert raw loan book data to legacy format for compatibility
  const loanBookData = rawLoanBookData?.map(loan => {
    // Create a proper LoanBookLiveRecord first
    const loanRecord = {
      id: loan.id,
      client_name: loan.client_name,
      amount_returnable: loan.amount_returnable ?? 0,
      "30-05-2025": loan["30-05-2025"] ?? 0,
      "31-05-2025": loan["31-05-2025"] ?? 0,
      "02-06-2025": loan["02-06-2025"] ?? 0,
      "04-06-2025": loan["04-06-2025"] ?? 0,
      "05-06-2025": loan["05-06-2025"] ?? 0,
      "07-06-2025": loan["07-06-2025"] ?? 0,
      "10-06-2025": loan["10-06-2025"] ?? 0,
      "11-06-2025": loan["11-06-2025"] ?? 0,
      "12-06-2025": loan["12-06-2025"] ?? 0,
      "13-06-2025": loan["13-06-2025"] ?? 0,
      "14-06-2025": loan["14-06-2025"] ?? 0,
      "16-06-2025": loan["16-06-2025"] ?? 0,
      remaining_balance: loan.remaining_balance ?? 0,
      loan_date: String(loan.loan_date || ""),
      status: loan.status || "",
      payment_mode: loan.payment_mode || "",
      created_at: String(loan.created_at || ""),
      updated_at: String(loan.updated_at || ""),
      user_id: loan.user_id ?? null,
      risk_score: loan.risk_score ?? 0,
      default_probability: loan.default_probability ?? 0,
      risk_level: (loan.risk_level as 'low' | 'medium' | 'high' | 'critical') ?? 'low',
      risk_factors: (typeof loan.risk_factors === 'string' ? 
        JSON.parse(loan.risk_factors) : loan.risk_factors) ?? {},
    };
    
    // Then adapt it to legacy format
    return adaptLoanRecordToLegacy(loanRecord);
  }) || [];

  const filteredLoanBook = loanBookData?.filter(loan => 
    loan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
  ) || [];

  const filteredExpenses = expensesData?.filter(expense => 
    expense.Account?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
    expense.particulars?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) || ''
  ) || [];

  const isLoading = summaryLoading || loanBookLoading || expensesLoading;

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
                Payment Center
              </h1>
              <p className="text-gray-600 mt-2">
                Financial management with data from the financial_summary table
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 px-4 shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Financial Summary Cards from financial_summary table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumFinancialOverview />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="transactions" className="text-sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Transaction Editor
              </TabsTrigger>
              <TabsTrigger value="loan-book" className="text-sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Smart Loan Book
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-sm">
                <TrendingDown className="mr-2 h-4 w-4" />
                Live Expenses
              </TabsTrigger>
              <TabsTrigger value="summary" className="text-sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6 mt-6">
              <TransactionEditor />
            </TabsContent>

            <TabsContent value="loan-book" className="space-y-6 mt-6">
              <DynamicLoanBookTable
                loanData={loanBookData}
                isLoading={loanBookLoading}
                onExport={handleExportLoanBook}
                isExporting={isExportingLoanBook}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <TrendingDown className="mr-2 h-5 w-5" />
                      Live Expense Management ({filteredExpenses.length} records)
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">Real-time</Badge>
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExportExpenses}
                        disabled={isExportingExpenses}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {isExportingExpenses ? 'Exporting...' : 'Export'}
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
                          <TableHead>Account</TableHead>
                          <TableHead>Particulars</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Expense Date</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead>Final Amount</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.length > 0 ? (
                          filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell className="font-medium">{expense.Account}</TableCell>
                              <TableCell>{expense.particulars}</TableCell>
                              <TableCell className="text-red-600 font-semibold">
                                {formatCurrency(expense.amount)}
                              </TableCell>
                              <TableCell>
                                {new Date(expense.expense_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{expense.account_name || 'N/A'}</TableCell>
                              <TableCell className="text-blue-600">
                                {formatCurrency(expense.Final_amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {expense.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={expense.status === 'approved' ? 'default' : 'secondary'}
                                  className={expense.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {expense.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
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

            <TabsContent value="summary" className="space-y-6 mt-6">
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Payments;
