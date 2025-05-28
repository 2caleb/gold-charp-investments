import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SmartDashboardMonitor from '@/components/dashboard/SmartDashboardMonitor';
import { FieldOfficerActivity } from '@/components/dashboard/FieldOfficerActivity';
import { LoanPerformanceChart } from '@/components/dashboard/LoanPerformanceChart';
import { PropertyInsights } from '@/components/dashboard/PropertyInsights';
import { RiskProfileMap } from '@/components/dashboard/RiskProfileMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, TrendingUp, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your loan management activities.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active client accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loan Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData?.totalLoans || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overviewData?.approvedLoans || 0} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {(overviewData?.totalLoanAmount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total loan amounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {(overviewData?.totalIncome || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total income generated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/new-client">
                <Button className="w-full" variant="outline">
                  Add New Client
                </Button>
              </Link>
              <Link to="/new-loan-application">
                <Button className="w-full" variant="outline">
                  New Loan Application
                </Button>
              </Link>
              <Link to="/reports">
                <Button className="w-full" variant="outline">
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SmartDashboardMonitor />
            <FieldOfficerActivity />
          </div>
          <div className="space-y-6">
            <LoanPerformanceChart />
            <PropertyInsights />
          </div>
        </div>

        <RiskProfileMap />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
