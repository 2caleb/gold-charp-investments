
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface DashboardMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  totalClients: number;
  totalLoanAmount: number;
  recentActivity: any[];
  systemAlerts: any[];
}

const EnhancedSmartDashboardMonitor = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      try {
        // Fetch loan applications
        const { data: applications, error: appsError } = await supabase
          .from('loan_applications')
          .select('*');
        
        if (appsError) throw appsError;

        // Fetch clients
        const { data: clients, error: clientsError } = await supabase
          .from('client_name')
          .select('*')
          .is('deleted_at', null);
        
        if (clientsError) throw clientsError;

        // Fetch recent workflow activities
        const { data: activities, error: activitiesError } = await supabase
          .from('loan_workflow_log')
          .select('*')
          .order('performed_at', { ascending: false })
          .limit(10);

        if (activitiesError) throw activitiesError;

        // Calculate metrics
        const totalApplications = applications?.length || 0;
        const pendingApplications = applications?.filter(app => 
          ['submitted', 'pending_manager', 'pending_director', 'pending_ceo', 'pending_chairperson'].includes(app.status)
        ).length || 0;
        const approvedApplications = applications?.filter(app => app.status === 'approved').length || 0;
        const totalClients = clients?.length || 0;
        const totalLoanAmount = applications?.reduce((sum, app) => sum + parseFloat(app.loan_amount || '0'), 0) || 0;

        // Generate system alerts
        const systemAlerts = [];
        if (pendingApplications > 10) {
          systemAlerts.push({
            type: 'warning',
            message: `${pendingApplications} applications pending approval`,
            priority: 'high'
          });
        }
        if (totalLoanAmount > 100000000) {
          systemAlerts.push({
            type: 'info',
            message: 'Total loan portfolio exceeds 100M UGX',
            priority: 'medium'
          });
        }

        setLastUpdate(new Date());
        setIsConnected(true);

        return {
          totalApplications,
          pendingApplications,
          approvedApplications,
          totalClients,
          totalLoanAmount,
          recentActivity: activities || [],
          systemAlerts
        };
      } catch (error) {
        console.error('Dashboard metrics fetch error:', error);
        setIsConnected(false);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Smart Dashboard Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading dashboard metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <WifiOff className="mr-2 h-5 w-5" />
            Dashboard Monitor - Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load dashboard data. Please check your connection.
              <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {isConnected ? (
                <Wifi className="mr-2 h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="mr-2 h-5 w-5 text-red-600" />
              )}
              Smart Dashboard Monitor
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics?.totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-900">{metrics?.pendingApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{metrics?.approvedApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Total Clients</p>
                  <p className="text-2xl font-bold text-purple-900">{metrics?.totalClients}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(metrics?.totalLoanAmount || 0)}
                </p>
              </div>
              <TrendingUp className="ml-auto h-6 w-6 text-green-600" />
            </div>
          </div>

          {/* System Alerts */}
          {metrics?.systemAlerts && metrics.systemAlerts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                System Alerts
              </h4>
              <div className="space-y-2">
                {metrics.systemAlerts.map((alert, index) => (
                  <Alert key={index} className={`${
                    alert.type === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      {alert.message}
                      <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                        {alert.priority}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Recent Activity
            </h4>
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {metrics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.performed_at).toLocaleString()}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge className={getStatusBadgeColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSmartDashboardMonitor;
