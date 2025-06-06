import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import LiveFinancialMetrics from '@/components/dashboard/LiveFinancialMetrics';
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
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useEnhancedFinancialSync } from '@/hooks/use-enhanced-financial-sync';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Use enhanced financial sync for real-time data
  const { data: syncedFinancialData, isLoading: syncDataLoading, refetch: refetchSync } = useEnhancedFinancialSync();

  // Fetch loan book live data with real-time updates
  const { data: loanBookData, isLoading: loanBookLoading, refetch: refetchLoanBook } = useQuery({
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

  // Fetch expenses live data with real-time updates
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

  // Set up real-time subscriptions
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

    return () => {
      supabase.removeChannel(loanBookChannel);
      supabase.removeChannel(expensesChannel);
    };
  }, [refetchLoanBook, refetchExpenses]);

  const handleSyncData = async () => {
    setSyncLoading(true);
    setSyncStatus('idle');
    
    try {
      console.log('Starting manual financial summary update...');
      
      // Call the database function to update financial summary
      const { error: rpcError } = await supabase.rpc('update_financial_summary');
      
      if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw new Error(`Database sync failed: ${rpcError.message}`);
      }

      console.log('Financial summary updated successfully');

      // Wait a moment for the update to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refetch all data
      await Promise.all([
        refetchSync(),
        refetchLoanBook(),
        refetchExpenses()
      ]);

      setSyncStatus('success');
      toast({
        title: "Sync Successful",
        description: "All financial data has been synchronized and updated successfully",
        variant: "default"
      });

    } catch (error) {
      console.error('Detailed sync error:', error);
      setSyncStatus('error');
      
      // Provide more specific error feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Sync Error",
        description: `Failed to synchronize data: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return 'UGX 0';
    
    let numAmount: number;
    if (typeof amount === 'string') {
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
    loan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
  ) || [];

  const filteredExpenses = expensesData?.filter(expense => 
    expense.Account?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
    expense.particulars?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) || ''
  ) || [];

  const isLoading = syncDataLoading || loanBookLoading || expensesLoading;

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
                Real-time financial management and payment tracking with synchronized data
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSyncData}
                disabled={syncLoading}
                variant="outline"
                className={`flex items-center gap-2 ${
                  syncStatus === 'success' ? 'border-green-500 text-green-600' :
                  syncStatus === 'error' ? 'border-red-500 text-red-600' : ''
                }`}
              >
                {syncLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : syncStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : syncStatus === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {syncLoading ? 'Syncing...' : 'Sync Data'}
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 px-4 shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-10 px-4 shrink-0">
                <Send className="mr-2 h-4 w-4" />
                Money Transfer
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Financial Summary Cards with Real-time Data */}
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
                    <p className="text-sm font-medium text-blue-700">Total Loan Portfolio</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(syncedFinancialData?.real_time_total_portfolio || syncedFinancialData?.total_loan_portfolio || 0)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      {syncedFinancialData?.is_live_data ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Live synchronized
                        </>
                      ) : (
                        'From summary table'
                      )}
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
                    <p className="text-sm font-medium text-green-700">Total Repaid</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(syncedFinancialData?.real_time_total_repaid || syncedFinancialData?.total_repaid || 0)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {syncedFinancialData?.real_time_collection_rate?.toFixed(1) || syncedFinancialData?.collection_rate?.toFixed(1) || 0}% collection rate
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
                    <p className="text-sm font-medium text-purple-700">Active Loan Holders</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {syncedFinancialData?.real_time_active_loan_holders || syncedFinancialData?.active_loan_holders || 0}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Live count</p>
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
                      (syncedFinancialData?.real_time_net_income || syncedFinancialData?.net_income || 0) >= 0 
                        ? 'text-green-900' 
                        : 'text-red-900'
                    }`}>
                      {formatCurrency(syncedFinancialData?.real_time_net_income || syncedFinancialData?.net_income || 0)}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">Real-time calculated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Live Financial Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LiveFinancialMetrics />
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
                Live Loan Book
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-sm">
                <TrendingDown className="mr-2 h-4 w-4" />
                Live Expenses
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6 mt-6">
              <TransactionEditor />
            </TabsContent>

            <TabsContent value="loan-book" className="space-y-6 mt-6">
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="flex items-center text-lg">
                      <DollarSign className="mr-3 h-5 w-5" />
                      Live Loan Book ({filteredLoanBook.length} records) 
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">Real-time</Badge>
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
                          <TableHead>Loan Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLoanBook.length > 0 ? (
                          filteredLoanBook.map((loan) => (
                            <TableRow key={loan.id}>
                              <TableCell className="font-medium">{loan.client_name}</TableCell>
                              <TableCell className="text-blue-600 font-semibold">
                                {formatCurrency(loan.amount_returnable)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(loan.amount_paid_1)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(loan.amount_paid_2)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(loan.amount_paid_3)}
                              </TableCell>
                              <TableCell className="text-red-600 font-semibold">
                                {formatCurrency(loan.remaining_balance)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{loan.payment_mode || 'Not specified'}</Badge>
                              </TableCell>
                              <TableCell>{new Date(loan.loan_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={loan.status === 'active' ? 'default' : 'secondary'}
                                  className={loan.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {loan.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
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

            <TabsContent value="reports" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Enhanced Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Active Loans:</span>
                        <span className="font-semibold">{syncedFinancialData?.real_time_active_loan_holders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Portfolio Value:</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(syncedFinancialData?.real_time_total_portfolio || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Repaid:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(syncedFinancialData?.real_time_total_repaid || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outstanding Balance:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(syncedFinancialData?.outstanding_balance || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span>Collection Rate:</span>
                        <span className="font-semibold text-purple-600">
                          {syncedFinancialData?.real_time_collection_rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Income:</span>
                        <span className={`font-semibold ${
                          (syncedFinancialData?.real_time_net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(syncedFinancialData?.real_time_net_income || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Data Synchronization Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Sync Status:</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {syncedFinancialData?.sync_status || 'Active'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Last Updated:</span>
                        <span className="text-sm text-gray-600">
                          {syncedFinancialData?.last_calculated 
                            ? new Date(syncedFinancialData.last_calculated).toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Real-time Data:</span>
                        <Badge variant={syncedFinancialData?.is_live_data ? "default" : "secondary"}>
                          {syncedFinancialData?.is_live_data ? 'Active' : 'Cached'}
                        </Badge>
                      </div>
                      <div className="space-y-3 pt-4">
                        <Button className="w-full" onClick={handleSyncData}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Force Sync Now
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export All Data
                        </Button>
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
