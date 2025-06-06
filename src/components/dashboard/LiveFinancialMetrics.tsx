
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnhancedFinancialSummaryQuery } from '@/hooks/use-enhanced-financial-summary';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  Clock,
  Wifi,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const LiveFinancialMetrics = () => {
  const { data: financialData, isLoading, error, refetch, dataUpdatedAt } = useEnhancedFinancialSummaryQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatLastUpdate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading live financial metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-600">Failed to load live data</span>
          </div>
          <Button onClick={handleManualRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Status Header */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Wifi className="mr-2 h-5 w-5 text-green-600" />
              Live Financial Metrics
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">
                Auto-updating
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                <span>Last update: {formatLastUpdate(dataUpdatedAt)}</span>
              </div>
              <Button onClick={handleManualRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Active Loan Holders</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-blue-900">
                      {financialData?.real_time_active_loan_holders || financialData?.active_loan_holders || 0}
                    </p>
                    {financialData?.is_live_data && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">From active loans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Collection Rate</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-green-900">
                      {(financialData?.real_time_collection_rate || financialData?.collection_rate || 0).toFixed(1)}%
                    </p>
                    {financialData?.is_live_data && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-1">Payment efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Portfolio Value</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(financialData?.real_time_total_portfolio || financialData?.total_loan_portfolio || 0)}
                    </p>
                    {financialData?.is_live_data && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Total active loans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Info */}
      {financialData?.last_calculated && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Database last calculated: {new Date(financialData.last_calculated).toLocaleString()}</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Auto-updating enabled
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveFinancialMetrics;
