
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PremiumWelcomeSection from '@/components/dashboard/PremiumWelcomeSection';
import PremiumFinancialOverview from '@/components/dashboard/PremiumFinancialOverview';
import SmartDashboardMonitor from '@/components/dashboard/SmartDashboardMonitor';
import { FieldOfficerActivity } from '@/components/dashboard/FieldOfficerActivity';
import { LoanPerformanceChart } from '@/components/dashboard/LoanPerformanceChart';
import { PropertyInsights } from '@/components/dashboard/PropertyInsights';
import { RiskProfileMap } from '@/components/dashboard/RiskProfileMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, TrendingUp, Shield, Plus, BarChart3, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  // Fetch dashboard overview data
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const [clientsResponse, loansResponse, paymentsResponse] = await Promise.all([
        supabase.from('client_name').select('id'),
        supabase.from('loan_applications').select('id, status, loan_amount'),
        supabase.from('financial_transactions').select('amount, transaction_type')
      ]);

      const totalClients = clientsResponse.data?.length || 0;
      const totalLoans = loansResponse.data?.length || 0;
      const approvedLoans = loansResponse.data?.filter(loan => loan.status === 'approved').length || 0;
      const totalLoanAmount = loansResponse.data?.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0) || 0;
      const totalIncome = paymentsResponse.data?.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      return {
        totalClients,
        totalLoans,
        approvedLoans,
        totalLoanAmount,
        totalIncome
      };
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
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

        {/* Traditional Overview Cards for Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{overviewData?.totalClients || 0}</div>
                <p className="text-xs text-blue-600">
                  Active client accounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Loan Applications</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{overviewData?.totalLoans || 0}</div>
                <p className="text-xs text-green-600">
                  {overviewData?.approvedLoans || 0} approved
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Portfolio Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  UGX {(overviewData?.totalLoanAmount || 0).toLocaleString()}
                </div>
                <p className="text-xs text-purple-600">
                  Total loan amounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Revenue</CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  UGX {(overviewData?.totalIncome || 0).toLocaleString()}
                </div>
                <p className="text-xs text-orange-600">
                  Total income generated
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Premium Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-slate-50 to-gray-100 border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/new-client">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Client
                  </Button>
                </Link>
                <Link to="/new-loan-application">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300">
                    <FileText className="mr-2 h-4 w-4" />
                    New Loan Application
                  </Button>
                </Link>
                <Link to="/payments">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg transition-all duration-300">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Center
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg transition-all duration-300">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Components Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="space-y-6">
            <SmartDashboardMonitor />
            <FieldOfficerActivity />
          </div>
          <div className="space-y-6">
            <LoanPerformanceChart />
            <PropertyInsights />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RiskProfileMap />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
