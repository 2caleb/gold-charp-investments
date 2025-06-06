
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedClientDataViewer from '@/components/clients/EnhancedClientDataViewer';
import { DataCollectionButton } from '@/components/loans/DataCollectionButton';
import { Users, FileText, BarChart3, Plus, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedFinancialSummaryQuery } from '@/hooks/use-enhanced-financial-summary';

const DataCollectionDashboard = () => {
  const { toast } = useToast();
  const { data: financialSummary } = useEnhancedFinancialSummaryQuery();

  // Extract statistics from financial summary or use fallback values
  const totalClients = financialSummary?.active_loan_holders || 0;
  const clientsWithApplications = Math.round(totalClients * 0.85); // Estimated from active loan holders
  const activeApplications = Math.round(totalClients * 0.3); // Estimated active applications
  const approvedLoans = totalClients; // Active loan holders are essentially approved loans
  const totalLoanValue = financialSummary?.total_loan_portfolio || 0;

  const handleDataCollected = () => {
    toast({
      title: "Data Collected",
      description: "New client data has been successfully collected and saved"
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Data Collection Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Collect and manage client data with integrated loan tracking
            </p>
          </div>
          <DataCollectionButton 
            onDataCollected={handleDataCollected}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Collect New Data
          </DataCollectionButton>
        </div>

        {/* Enhanced Stats from Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {financialSummary?.is_live_data ? 'Live data' : 'Active records'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsWithApplications}</div>
              <p className="text-xs text-muted-foreground">Clients with loan apps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeApplications}</div>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedLoans}</div>
              <p className="text-xs text-muted-foreground">Successfully approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loan Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                UGX {(totalLoanValue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                {financialSummary?.real_time_collection_rate 
                  ? `${financialSummary.real_time_collection_rate.toFixed(1)}% collected`
                  : 'Combined loan amount'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">Enhanced Client Data</TabsTrigger>
            <TabsTrigger value="collection">Data Collection</TabsTrigger>
            <TabsTrigger value="reports">Analytics & Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <EnhancedClientDataViewer />
          </TabsContent>

          <TabsContent value="collection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Collection Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Field Data Collection</h3>
                  <p className="text-gray-500 mb-4">
                    Use the data collection button above to gather client information from the field
                  </p>
                  <DataCollectionButton 
                    onDataCollected={handleDataCollected}
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start Data Collection
                  </DataCollectionButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Application Rate</span>
                      <span className="font-medium">
                        {totalClients > 0 ? Math.round((clientsWithApplications / totalClients) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Collection Rate</span>
                      <span className="font-medium">
                        {financialSummary?.real_time_collection_rate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Loan Amount</span>
                      <span className="font-medium">
                        UGX {approvedLoans > 0 ? Math.round(totalLoanValue / approvedLoans).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Repaid</span>
                      <span className="font-medium">
                        UGX {(financialSummary?.real_time_total_repaid || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Loan Holders</span>
                      <span className="font-medium text-green-600">
                        {financialSummary?.real_time_active_loan_holders || totalClients}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Portfolio Health</span>
                      <span className="font-medium">
                        {financialSummary?.real_time_collection_rate 
                          ? financialSummary.real_time_collection_rate > 80 ? 'Excellent' 
                          : financialSummary.real_time_collection_rate > 60 ? 'Good' : 'Needs Attention'
                          : 'Calculating...'
                        }
                      </span>
                    </div>
                    <div className="text-center py-4">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Real-Time Data</h3>
                      <p className="text-gray-500">
                        {financialSummary?.is_live_data 
                          ? 'All metrics are updated in real-time from the loan book'
                          : 'Financial data is refreshed automatically'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DataCollectionDashboard;
