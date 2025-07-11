
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
  BarChart3,
  Package
} from 'lucide-react';
import { useFinancialSummaryQuery } from '@/hooks/use-financial-summary-query';
import DynamicLoanBookTable from '@/components/payments/DynamicLoanBookTable';
import DeliveryManagement from '@/components/deliveries/DeliveryManagement';
import StickyNotes from '@/components/payments/StickyNotes';

import { usePaymentHandlers } from '@/hooks/usePaymentHandlers';
import { formatCurrency } from '@/utils/currencyUtils';
import { LoanBookLiveRecord } from '@/types/loan-book-live-record';

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
      console.log('Raw loan book data from database:', data);
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

  // Convert raw loan book data to proper LoanBookLiveRecord format with proper null handling
  const loanBookData = rawLoanBookData?.map(loan => {
    console.log('Processing loan record:', loan.client_name, loan);
    console.log('Available payment columns in this record:', Object.keys(loan).filter(key => key.includes('-') && key.includes('2025')));
    
    // Helper function to safely process payment values
    const processPaymentValue = (value: any): number | null => {
      // Handle various null representations including Supabase's <nil>
      if (value === null || value === undefined || value === '<nil>' || value === '' || value === 'null') {
        return null;
      }
      // Convert to number and validate
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return null;
      }
      return numValue;
    };
    
    // Create a complete LoanBookLiveRecord with proper payment processing
    const loanRecord: LoanBookLiveRecord = {
      id: loan.id,
      client_name: loan.client_name,
      amount_returnable: loan.amount_returnable ?? 0,
      // Process each payment column with proper null handling
      "19-05-2025": processPaymentValue(loan["19-05-2025"]),
      "22-05-2025": processPaymentValue(loan["22-05-2025"]),
      "26-05-2025": processPaymentValue(loan["26-05-2025"]),
      "27-05-2025": processPaymentValue(loan["27-05-2025"]),
      "28-05-2025": processPaymentValue(loan["28-05-2025"]),
      "30-05-2025": processPaymentValue(loan["30-05-2025"]),
      "31-05-2025": processPaymentValue(loan["31-05-2025"]),
      "02-06-2025": processPaymentValue(loan["02-06-2025"]),
      "04-06-2025": processPaymentValue(loan["04-06-2025"]),
      "05-06-2025": processPaymentValue(loan["05-06-2025"]),
      "07-06-2025": processPaymentValue(loan["07-06-2025"]),
      "10-06-2025": processPaymentValue(loan["10-06-2025"]),
      "11-06-2025": processPaymentValue(loan["11-06-2025"]),
      "12-06-2025": processPaymentValue(loan["12-06-2025"]),
      "13-06-2025": processPaymentValue(loan["13-06-2025"]),
      "14-06-2025": processPaymentValue(loan["14-06-2025"]),
      "16-06-2025": processPaymentValue(loan["16-06-2025"]),
      "17-06-2025": processPaymentValue(loan["17-06-2025"]),
      "18-06-2025": processPaymentValue(loan["18-06-2025"]),
      "19-06-2025": processPaymentValue(loan["19-06-2025"]),
      "20-06-2025": processPaymentValue(loan["20-06-2025"]),
      "23-06-2025": processPaymentValue(loan["23-06-2025"]),
      "24-06-2025": processPaymentValue(loan["24-06-2025"]),
      "25-06-2025": processPaymentValue(loan["25-06-2025"]),
      "26-06-2025": processPaymentValue(loan["26-06-2025"]),
      "27-06-2025": processPaymentValue(loan["27-06-2025"]),
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
    
    console.log('Processed loan record with payments:', loanRecord.client_name, {
      "30-05-2025": loanRecord["30-05-2025"],
      "31-05-2025": loanRecord["31-05-2025"],
      "02-06-2025": loanRecord["02-06-2025"],
      "13-06-2025": loanRecord["13-06-2025"],
      "total_payments": Object.keys(loanRecord).filter(key => key.includes('-2025')).reduce((sum, key) => {
        const val = loanRecord[key as keyof LoanBookLiveRecord];
        return sum + (typeof val === 'number' && val > 0 ? val : 0);
      }, 0)
    });
    
    // Return the original LoanBookLiveRecord format directly - no legacy adapter conversion!
    return loanRecord;
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

  console.log('Final loan book data being passed to table:', loanBookData?.length, loanBookData?.[0]);

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
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="transactions" className="text-sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Transaction Editor
              </TabsTrigger>
              <TabsTrigger value="loan-book" className="text-sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Smart Loan Book
              </TabsTrigger>
              <TabsTrigger value="deliveries" className="text-sm">
                <Package className="mr-2 h-4 w-4" />
                Egg Deliveries
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
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <TransactionEditor />
                </div>
                <StickyNotes recordType="payment" recordId="transactions" className="ml-4" />
              </div>
            </TabsContent>

            <TabsContent value="loan-book" className="space-y-6 mt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <DynamicLoanBookTable
                    loanData={loanBookData}
                    isLoading={loanBookLoading}
                    onExport={() => handleExportLoanBook(loanBookData)}
                    isExporting={isExportingLoanBook}
                  />
                </div>
                <StickyNotes recordType="loan" recordId="loan-book" className="ml-4" />
              </div>
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-6 mt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <DeliveryManagement />
                </div>
                <StickyNotes recordType="delivery" recordId="deliveries" className="ml-4" />
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 mt-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <ExpensesTable
                    filteredExpenses={filteredExpenses}
                    expenseSearchTerm={expenseSearchTerm}
                    setExpenseSearchTerm={setExpenseSearchTerm}
                    onExport={() => handleExportExpenses(filteredExpenses)}
                    isExporting={isExportingExpenses}
                  />
                </div>
                <StickyNotes recordType="expense" recordId="expenses" className="ml-4" />
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6 mt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <SummaryTab financialSummary={financialSummary} />
                </div>
                <StickyNotes recordType="payment" recordId="summary" className="ml-4" />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Payments;
