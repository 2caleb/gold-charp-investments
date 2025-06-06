import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, FileText, Users } from 'lucide-react';
import { useEnhancedFinancialSummaryQuery } from '@/hooks/use-enhanced-financial-summary';
import { format } from 'date-fns';
import DatabaseEditingGuide from '@/components/financial/DatabaseEditingGuide';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const Dashboard = () => {
  const [showDatabaseGuide, setShowDatabaseGuide] = useState(false);
  const { data: financialSummary } = useEnhancedFinancialSummaryQuery();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (showDatabaseGuide) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseGuide(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <DatabaseEditingGuide />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Add database editing button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseGuide(true)}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Edit Financial Data
          </Button>
        </div>

        {/* Financial Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {(financialSummary?.total_income || 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatDate(financialSummary?.last_calculated)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {(financialSummary?.total_expenses || 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatDate(financialSummary?.last_calculated)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Loan Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {(financialSummary?.total_loan_portfolio || 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatDate(financialSummary?.last_calculated)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialSummary?.collection_rate?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatDate(financialSummary?.last_calculated)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan and Client Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span>Client Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Active Clients</span>
                  <span className="font-bold">
                    {financialSummary?.active_loan_holders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Clients (Last 30 Days)</span>
                  <span className="font-bold">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Loan Size</span>
                  <span className="font-bold">
                    UGX {(financialSummary?.total_loan_portfolio || 0) / (financialSummary?.active_loan_holders || 1) }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span>Loan Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Loans Approved</span>
                  <span className="font-bold">
                    {financialSummary?.active_loan_holders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Loans in Arrears</span>
                  <span className="font-bold">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Interest Rate</span>
                  <span className="font-bold">N/A</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <span>Financial Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Net Income</span>
                  <span className="font-bold">
                    UGX {(financialSummary?.net_income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Profit Margin</span>
                  <span className="font-bold">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expense Ratio</span>
                  <span className="font-bold">N/A</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
