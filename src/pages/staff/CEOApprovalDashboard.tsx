import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from '@/hooks/use-role-permissions';

const CEOApprovalDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole } = useRolePermissions();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        setIsLoading(true);
        
        // Fetch applications pending CEO approval - simplified query
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('status', 'pending_ceo')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setApplications(data || []);
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Failed to load applications',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole === 'ceo') {
      fetchPendingApplications();
    }
  }, [toast, userRole]);

  const handleViewApplication = (id: string) => {
    navigate(`/loan-approval/${id}`);
  };

  if (userRole !== 'ceo') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">CEO Approval Dashboard</h1>
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
        <h1 className="text-3xl font-bold mb-2">CEO Approval Dashboard</h1>
        <p className="text-lg text-gray-600 mb-6">
          Review and approve loan applications that have passed risk assessment by directors.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <p className="text-lg text-gray-600 mb-2">No applications pending CEO approval</p>
              <p className="text-gray-500">All current applications have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id} className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-medium">
                      {application.client_name}
                    </CardTitle>
                    <Badge className="bg-blue-500">{application.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                      <p className="text-lg">{application.loan_amount} UGX</p>
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
                      <p className="text-sm font-medium text-gray-500">Stage</p>
                      <p className="text-lg">CEO Approval</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => handleViewApplication(application.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review for Approval
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CEOApprovalDashboard;
