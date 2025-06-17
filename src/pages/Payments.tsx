import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import TransactionEditor from '@/components/transactions/TransactionEditor';
import FinancialSummaryCards from '@/components/payments/FinancialSummaryCards';
import ExpensesTable from '@/components/payments/ExpensesTable';
import SummaryTab from '@/components/payments/SummaryTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingDown, 
  DollarSign, 
  Plus,
  BarChart3
} from 'lucide-react';
import { useFinancialSummaryQuery } from '@/hooks/use-financial-summary-query';
import DynamicLoanBookTable from '@/components/payments/DynamicLoanBookTable';
import { adaptLoanRecordToLegacy } from '@/types/loan-book-adapter';
import { usePaymentHandlers } from '@/hooks/usePaymentHandlers';
import { formatCurrency } from '@/utils/currencyUtils';

const Payments = () => {
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  
  const {
    handleExportLoanBook,
    handleExportExpenses,
    isExportingLoanBook,
    isExportingExpenses,
  } = usePaymentHandlers();

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
          <FinancialSummaryCards financialSummary={financialSummary} />
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
                onExport={() => handleExportLoanBook(loanBookData)}
                isExporting={isExportingLoanBook}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 mt-4">
              <ExpensesTable
                filteredExpenses={filteredExpenses}
                expenseSearchTerm={expenseSearchTerm}
                setExpenseSearchTerm={setExpenseSearchTerm}
                onExport={() => handleExportExpenses(filteredExpenses)}
                isExporting={isExportingExpenses}
              />
            </TabsContent>

            <TabsContent value="summary" className="space-y-6 mt-6">
              <SummaryTab financialSummary={financialSummary} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Payments;
