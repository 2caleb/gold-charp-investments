
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import { FieldOfficerActivity } from '@/components/dashboard/FieldOfficerActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, TrendingUp, Shield, Plus, BarChart3, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  // Fetch dashboard overview data from financial_summary and other tables
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const [summaryResponse, clientsResponse, loansResponse] = await Promise.all([
        supabase.from('financial_summary').select('*').order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('client_name').select('id'),
        supabase.from('loan_applications').select('id, status, loan_amount')
      ]);

      const totalClients = clientsResponse.data?.length || 0;
      const totalLoans = loansResponse.data?.length || 0;
      const approvedLoans = loansResponse.data?.filter(loan => loan.status === 'approved').length || 0;
      
      // Use financial_summary data for financial metrics
      const financialSummary = summaryResponse.data;

      return {
        totalClients,
        totalLoans,
        approvedLoans,
        totalLoanAmount: financialSummary?.total_loan_portfolio || 0,
        totalIncome: financialSummary?.total_income || 0,
        totalRepaid: financialSummary?.total_repaid || 0,
        outstandingBalance: financialSummary?.outstanding_balance || 0,
        collectionRate: financialSummary?.collection_rate || 0
      };
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6 p-4 sm:p-6">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Premium Welcome Section */}
        <PremiumWelcomeSection />

        {/* Premium Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PremiumFinancialOverview />
        </motion.div>

        {/* Enhanced Overview Cards with Better Padding and Text Fitting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 leading-tight">
                  Total Clients
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-900 mb-1">
                  {overviewData?.totalClients || 0}
                </div>
                <p className="text-xs text-blue-600 leading-tight">
                  Active client accounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-700 leading-tight">
                  Loan Applications
                </CardTitle>
                <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-green-900 mb-1">
                  {overviewData?.totalLoans || 0}
                </div>
                <p className="text-xs text-green-600 leading-tight">
                  {overviewData?.approvedLoans || 0} approved
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 leading-tight">
                  Collection Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-purple-900 mb-1">
                  {(overviewData?.collectionRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-purple-600 leading-tight">
                  Payment collection rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 leading-tight">
                  Outstanding
                </CardTitle>
                <Shield className="h-4 w-4 text-orange-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-lg sm:text-xl font-bold text-orange-900 mb-1 break-words">
                  UGX {(overviewData?.outstandingBalance || 0).toLocaleString()}
                </div>
                <p className="text-xs text-orange-600 leading-tight">
                  Remaining balance
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Premium Quick Actions with Better Spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-slate-50 to-gray-100 border-gray-200 shadow-xl">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Plus className="mr-3 h-5 w-5 text-indigo-600 flex-shrink-0" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Link to="/new-client">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4">
                    <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Add New Client</span>
                  </Button>
                </Link>
                <Link to="/new-loan-application">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4">
                    <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">New Loan Application</span>
                  </Button>
                </Link>
                <Link to="/payments">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4">
                    <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Payment Center</span>
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4">
                    <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">View Reports</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Field Officer Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FieldOfficerActivity />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
