
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Database, Brain } from 'lucide-react';
import EnhancedLoanBookTable from './EnhancedLoanBookTable';
import EnhancedSmartAnalytics from './EnhancedSmartAnalytics';
import MLFinancialInsights from './MLFinancialInsights';

const EnhancedPaymentCenter = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Payment Center</h1>
          <p className="text-muted-foreground">
            AI-powered payment management with comprehensive analytics and machine learning insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="live-payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-payments" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Live Payments</span>
          </TabsTrigger>
          <TabsTrigger value="smart-analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Smart Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="ml-insights" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>ML Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Live Loan Portfolio Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedLoanBookTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-analytics" className="space-y-6">
          <EnhancedSmartAnalytics />
        </TabsContent>

        <TabsContent value="ml-insights" className="space-y-6">
          <MLFinancialInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPaymentCenter;
