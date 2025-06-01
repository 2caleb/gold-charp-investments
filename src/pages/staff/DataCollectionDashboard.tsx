
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import RealTimeUpdates from '@/components/loans/RealTimeUpdates';
import SmartDashboardMonitor from '@/components/dashboard/SmartDashboardMonitor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, ArrowUpRight, Building, CreditCard } from 'lucide-react';

interface LoanApplication {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
  purpose_of_loan: string;
  employment_status: string;
  monthly_income: number;
  address: string;
}

interface DashboardStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  totalDisbursed: number;
  averageAmount: number;
  totalClients: number;
  monthlyApplications: number;
  collectionRate: number;
}

const DataCollectionDashboard = () => {
  const { user } = useAuth();
  const [recentApplications, setRecentApplications] = useState<LoanApplication[]>([]);

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['data-collection-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // Get current month boundaries
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [
          allApplicationsRes,
          monthlyApplicationsRes,
          clientsRes,
          financialSummaryRes
        ] = await Promise.all([
          supabase.from('loan_applications').select('*'),
          supabase.from('loan_applications')
            .select('*')
            .gte('created_at', firstDayOfMonth.toISOString())
            .lte('created_at', lastDayOfMonth.toISOString()),
          supabase.from('client_name').select('id'),
          supabase.from('financial_summary')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ]);

        const allApplications = allApplicationsRes.data || [];
        const monthlyApplications = monthlyApplicationsRes.data || [];
        const totalClients = clientsRes.data?.length || 0;
        const financialSummary = financialSummaryRes.data;

        const approvedApplications = allApplications.filter(app => app.status === 'approved').length;
        const pendingApplications = allApplications.filter(app => app.status === 'pending' || app.status === 'submitted').length;
        
        const totalDisbursed = allApplications
          .filter(app => app.status === 'approved')
          .reduce((sum, app) => sum + parseFloat(app.loan_amount.replace(/,/g, '')), 0);
        
        const averageAmount = approvedApplications > 0 ? totalDisbursed / approvedApplications : 0;
        const collectionRate = financialSummary?.collection_rate || 0;

        return {
          totalApplications: allApplications.length,
          approvedApplications,
          pendingApplications,
          totalDisbursed,
          averageAmount,
          totalClients,
          monthlyApplications: monthlyApplications.length,
          collectionRate
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalApplications: 0,
          approvedApplications: 0,
          pendingApplications: 0,
          totalDisbursed: 0,
          averageAmount: 0,
          totalClients: 0,
          monthlyApplications: 0,
          collectionRate: 0
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent applications
  const { data: recentAppsData, isLoading: appsLoading } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: async (): Promise<LoanApplication[]> => {
      try {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching recent applications:', error);
        return [];
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  useEffect(() => {
    if (recentAppsData) {
      setRecentApplications(recentAppsData);
    }
  }, [recentAppsData]);

  useEffect(() => {
    const channel = supabase
      .channel('loan_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_applications'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Application Received',
              description: `New loan application from ${payload.new.client_name}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Application Updated',
              description: `Application status changed to ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isLoading = statsLoading || appsLoading;

  return (
    <Layout>
      <RealTimeUpdates onLoanUpdate={() => {}} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Data Collection Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Real-time monitoring of loan applications and financial data
            </p>
          </div>

          {/* Smart Monitor */}
          <div className="mb-6">
            <SmartDashboardMonitor />
          </div>

          {/* Enhanced Statistics Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="premium-card hover-lift bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Applications</CardTitle>
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {dashboardStats?.totalApplications || 0}
                  </div>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All time total
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Approved Loans</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {dashboardStats?.approvedApplications || 0}
                  </div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Successfully approved
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700">Pending Review</CardTitle>
                  <Calendar className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-900">
                    {dashboardStats?.pendingApplications || 0}
                  </div>
                  <p className="text-xs text-yellow-600 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Total Clients</CardTitle>
                  <Users className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {dashboardStats?.totalClients || 0}
                  </div>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Registered clients
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-700">Total Disbursed</CardTitle>
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-900">
                    {formatCurrency(dashboardStats?.totalDisbursed || 0)}
                  </div>
                  <p className="text-xs text-indigo-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Approved loans value
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-pink-700">Average Amount</CardTitle>
                  <ArrowUpRight className="h-5 w-5 text-pink-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-900">
                    {formatCurrency(dashboardStats?.averageAmount || 0)}
                  </div>
                  <p className="text-xs text-pink-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Per approved loan
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-teal-700">This Month</CardTitle>
                  <Calendar className="h-5 w-5 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-900">
                    {dashboardStats?.monthlyApplications || 0}
                  </div>
                  <p className="text-xs text-teal-600 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Monthly applications
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card hover-lift bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Collection Rate</CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {(dashboardStats?.collectionRate || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Payment collection
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Applications */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Recent Loan Applications
                <Badge variant="secondary" className="ml-auto">Live Updates</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{app.client_name}</h3>
                          <Badge className={`${getStatusColor(app.status)} border`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div>
                            <span className="font-medium">Amount:</span> {formatCurrency(parseInt(app.loan_amount.replace(/,/g, '')))}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {app.loan_type}
                          </div>
                          <div>
                            <span className="font-medium">Purpose:</span> {app.purpose_of_loan}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500">
                    Recent loan applications will appear here automatically.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DataCollectionDashboard;
