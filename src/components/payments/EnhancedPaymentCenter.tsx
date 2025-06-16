
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Calculator, Database } from 'lucide-react';
import DynamicLoanBookTable from './DynamicLoanBookTable';
import SmartExpenseAnalytics from './SmartExpenseAnalytics';

const EnhancedPaymentCenter = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Center</h1>
          <p className="text-muted-foreground">
            Comprehensive payment management with smart analytics and clustering
          </p>
        </div>
      </div>

      <Tabs defaultValue="live-payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-payments" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Live Payments</span>
          </TabsTrigger>
          <TabsTrigger value="expense-analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Smart Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="financial-insights" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Financial Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Live Payment Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicLoanBookTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense-analytics" className="space-y-6">
          <SmartExpenseAnalytics />
        </TabsContent>

        <TabsContent value="financial-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Advanced Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  This section will include predictive analytics, budget forecasting, and advanced financial modeling.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPaymentCenter;
