import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import RealTimeUpdates from '@/components/loans/RealTimeUpdates';
import SmartDashboardMonitor from '@/components/dashboard/SmartDashboardMonitor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, ArrowUpRight } from 'lucide-react';

interface LoanApplication {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
  purpose_of_loan: string;
  employment_status: string;
}

interface MonthlyStats {
  totalDisbursed: number;
  applicationCount: number;
  averageAmount: number;
  topEmploymentStatus: string;
}

const DataCollectionDashboard = () => {
  const { user } = useAuth();
  const [recentApplications, setRecentApplications] = useState<LoanApplication[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalDisbursed: 0,
    applicationCount: 0,
    averageAmount: 0,
    topEmploymentStatus: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchRecentApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setRecentApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch loan applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Fetch disbursed applications for current month (approved status = disbursed)
      const { data: disbursedData, error: disbursedError } = await supabase
        .from('loan_applications')
        .select('loan_amount, employment_status')
        .eq('status', 'approved')
        .gte('created_at', firstDay.toISOString())
        .lte('created_at', lastDay.toISOString());

      if (disbursedError) throw disbursedError;

      const totalDisbursed = disbursedData?.reduce((sum, app) => 
        sum + parseFloat(app.loan_amount.replace(/,/g, '')), 0) || 0;
      
      const applicationCount = disbursedData?.length || 0;
      const averageAmount = applicationCount > 0 ? totalDisbursed / applicationCount : 0;

      const employmentStatusCount = disbursedData?.reduce((acc, app) => {
        acc[app.employment_status] = (acc[app.employment_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topEmploymentStatus = Object.keys(employmentStatusCount).reduce((a, b) => 
        employmentStatusCount[a] > employmentStatusCount[b] ? a : b, '') || 'None';

      setMonthlyStats({
        totalDisbursed,
        applicationCount,
        averageAmount,
        topEmploymentStatus
      });
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  useEffect(() => {
    fetchRecentApplications();
    fetchMonthlyStats();
  }, [user]);

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
          fetchRecentApplications();
          fetchMonthlyStats();
          
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

  const handleLoanUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newApp = payload.new;
      setRecentApplications(prev => [newApp, ...prev].slice(0, 10));
    } else if (payload.eventType === 'UPDATE') {
      setRecentApplications(prev => 
        prev.map(app => app.id === payload.new.id ? payload.new : app)
      );
    }
  };

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

  return (
    <Layout>
      <RealTimeUpdates onLoanUpdate={handleLoanUpdate} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Data Collection Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Smart real-time monitoring of loan applications and disbursements
            </p>
          </div>

          {/* Smart Monitor */}
          <div className="mb-6">
            <SmartDashboardMonitor />
          </div>

          {/* Monthly Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="premium-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Monthly Disbursed</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(monthlyStats.totalDisbursed)}
                </div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Approved applications only
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Applications Count</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {monthlyStats.applicationCount}
                </div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  This month
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Amount</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(monthlyStats.averageAmount)}
                </div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Per application
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Top Employment</CardTitle>
                <Users className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 capitalize">
                  {monthlyStats.topEmploymentStatus || 'N/A'}
                </div>
                <p className="text-xs text-gray-500">Most common status</p>
              </CardContent>
            </Card>
          </div>

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
              {loading ? (
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
                            <span className="font-medium">Amount:</span> UGX {parseInt(app.loan_amount).toLocaleString()}
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
