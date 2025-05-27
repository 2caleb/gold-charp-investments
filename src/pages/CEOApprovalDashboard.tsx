
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useQuery } from '@tanstack/react-query';
import CEOFinancialDashboard from '@/components/dashboard/CEOFinancialDashboard';

const CEOApprovalDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole } = useRolePermissions();
  const [activeTab, setActiveTab] = useState('applications');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['ceo-pending-applications'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('status', 'pending_ceo')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Failed to load applications',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: userRole === 'ceo',
  });

  const handleViewApplication = (id: string) => {
    navigate(`/loan-applications/${id}`);
  };

  if (userRole !== 'ceo') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">CEO Dashboard</h1>
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-lg text-gray-600">
                You do not have permission to access this page. This page is only available for users with the CEO role.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CEO Executive Dashboard</h1>
          <p className="text-lg text-gray-600">
            Comprehensive overview of loan approvals, financial performance, and business metrics.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="applications" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Loan Approvals
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Financial Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Pending CEO Approval</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {applications?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Total Value</p>
                      <p className="text-2xl font-bold text-green-900">
                        UGX {(applications?.reduce((sum, app) => sum + parseFloat(app.loan_amount || '0'), 0) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Average Amount</p>
                      <p className="text-2xl font-bold text-purple-900">
                        UGX {applications?.length ? 
                          Math.round((applications.reduce((sum, app) => sum + parseFloat(app.loan_amount || '0'), 0) / applications.length)).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <p>Loading applications...</p>
              </div>
            ) : applications && applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No applications pending CEO approval</p>
                  <p className="text-gray-500">All current applications have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {applications?.map((application) => (
                  <Card key={application.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-medium">
                          {application.client_name}
                        </CardTitle>
                        <Badge className="bg-blue-500 text-white">CEO Review Required</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                          <p className="text-lg font-semibold">UGX {parseFloat(application.loan_amount || '0').toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Loan Type</p>
                          <p className="text-lg capitalize">{application.loan_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Purpose</p>
                          <p className="text-lg">{application.purpose_of_loan}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                          <p className="text-lg">UGX {application.monthly_income?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Employment</p>
                          <p className="text-lg">{application.employment_status}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Application Date</p>
                          <p className="text-lg">{new Date(application.created_at || '').toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {application.approval_notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Previous Notes</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{application.approval_notes}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="flex items-center bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleViewApplication(application.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review for Final Approval
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          ID: {application.id.slice(0, 8)}...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="financial">
            <CEOFinancialDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CEOApprovalDashboard;
