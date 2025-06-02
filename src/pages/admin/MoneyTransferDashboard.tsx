
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const MoneyTransferDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch transfer statistics
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['admin-transfers', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('money_transfers')
        .select(`
          *,
          transfer_recipients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!transfers) return null;

    const totalVolume = transfers.reduce((sum, t) => sum + t.send_amount, 0);
    const totalFees = transfers.reduce((sum, t) => sum + t.transfer_fee, 0);
    const completedTransfers = transfers.filter(t => t.status === 'completed').length;
    const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
    const failedTransfers = transfers.filter(t => t.status === 'failed').length;

    return {
      totalVolume,
      totalFees,
      totalTransfers: transfers.length,
      completedTransfers,
      pendingTransfers,
      failedTransfers,
      successRate: transfers.length > 0 ? (completedTransfers / transfers.length) * 100 : 0
    };
  }, [transfers]);

  const StatCard = ({ title, value, icon, trend, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="premium-card hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend > 0 ? '+' : ''}{trend}% from last period
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Money Transfer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and manage international money transfers</p>
          </div>
          
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? 'Last 7 days' : 
                 range === '30d' ? 'Last 30 days' :
                 range === '90d' ? 'Last 90 days' : 'Last year'}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Volume"
            value={`$${stats?.totalVolume?.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            trend={12.5}
            color="blue"
          />
          <StatCard
            title="Total Fees Earned"
            value={`$${stats?.totalFees?.toLocaleString() || '0'}`}
            icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
            trend={8.2}
            color="green"
          />
          <StatCard
            title="Total Transfers"
            value={stats?.totalTransfers?.toLocaleString() || '0'}
            icon={<Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
            trend={15.3}
            color="purple"
          />
          <StatCard
            title="Success Rate"
            value={`${stats?.successRate?.toFixed(1) || '0'}%`}
            icon={<CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
            trend={2.1}
            color="indigo"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transfers */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transfers?.slice(0, 5).map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-500' :
                          transfer.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{transfer.reference_number}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {transfer.send_currency} {transfer.send_amount} → {transfer.receive_currency} {transfer.receive_amount}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        transfer.status === 'completed' ? 'default' :
                        transfer.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {transfer.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Transfer Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="font-semibold">{stats?.completedTransfers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="font-semibold">{stats?.pendingTransfers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Failed</span>
                      </div>
                      <span className="font-semibold">{stats?.failedTransfers || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transfers?.map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transfer.reference_number}</span>
                          <Badge variant={
                            transfer.status === 'completed' ? 'default' :
                            transfer.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {transfer.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transfer.send_currency} {transfer.send_amount} → {transfer.receive_currency} {transfer.receive_amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transfer.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          Fee: ${transfer.transfer_fee}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Method: {transfer.transfer_method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Volume Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Volume chart would be rendered here
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Popular Corridors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">USA → Uganda</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">South Africa → Uganda</span>
                      <span className="font-semibold">30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">UK → Uganda</span>
                      <span className="font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Other</span>
                      <span className="font-semibold">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle>Transfer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Service Fee (%)</label>
                    <input 
                      type="number" 
                      defaultValue="20" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maximum Transfer Limit (USD)</label>
                    <input 
                      type="number" 
                      defaultValue="10000" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <Button className="premium-button">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MoneyTransferDashboard;
