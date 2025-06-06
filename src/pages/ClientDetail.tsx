
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import LiveLoanPerformance from '@/components/clients/LiveLoanPerformance';
import { 
  ArrowLeft, 
  Loader2, 
  FileCheck, 
  FilePlus, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedClient, LoanApplicationSummary } from '@/types/client';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchClientWithApplications = async (): Promise<EnhancedClient> => {
    if (!id) throw new Error("Client ID is required");
    
    console.log('Fetching client details for ID:', id);
    
    // Fetch client data from client_name table
    const { data: client, error: clientError } = await supabase
      .from('client_name')
      .select('*')
      .eq('id', id)
      .single();
    
    if (clientError) {
      console.error('Client fetch error:', clientError);
      throw new Error(`Failed to fetch client: ${clientError.message}`);
    }
    
    if (!client) {
      throw new Error("Client not found");
    }

    // Fetch loan applications for this client
    const { data: applications, error: appError } = await supabase
      .from('loan_applications')
      .select(`
        id,
        loan_amount,
        loan_type,
        status,
        created_at,
        purpose_of_loan,
        notes,
        rejection_reason
      `)
      .or(`client_name.eq.${client.full_name},phone_number.eq.${client.phone_number},id_number.eq.${client.id_number}`)
      .order('created_at', { ascending: false });

    if (appError) {
      console.error('Applications fetch error:', appError);
      // Don't throw, just log and continue without applications
    }

    // Fetch workflow data for applications
    const applicationIds = applications?.map(app => app.id) || [];
    let workflows: any[] = [];
    
    if (applicationIds.length > 0) {
      const { data: workflowData, error: workflowError } = await supabase
        .from('loan_applications_workflow')
        .select('*')
        .in('loan_application_id', applicationIds);

      if (workflowError) {
        console.error('Workflow fetch error:', workflowError);
      } else {
        workflows = workflowData || [];
      }
    }

    // Enhance applications with workflow data
    const applicationsWithWorkflow: LoanApplicationSummary[] = (applications || []).map(app => {
      const workflow = workflows.find(w => w.loan_application_id === app.id);
      return {
        id: app.id,
        loan_amount: app.loan_amount,
        loan_type: app.loan_type,
        status: app.status,
        created_at: app.created_at,
        current_stage: workflow?.current_stage,
        workflow_status: workflow ? {
          current_stage: workflow.current_stage,
          field_officer_approved: workflow.field_officer_approved || false,
          manager_approved: workflow.manager_approved || false,
          director_approved: workflow.director_approved || false,
          chairperson_approved: workflow.chairperson_approved || false,
          ceo_approved: workflow.ceo_approved || false,
        } : undefined
      };
    });

    // Calculate summary statistics
    const totalApplications = applicationsWithWorkflow.length;
    const activeApplications = applicationsWithWorkflow.filter(app => 
      ['submitted', 'pending_manager', 'pending_director', 'pending_ceo', 'pending_chairperson'].includes(app.status)
    ).length;
    const approvedLoans = applicationsWithWorkflow.filter(app => 
      app.status === 'approved' || app.status === 'disbursed'
    ).length;
    const totalLoanAmount = applicationsWithWorkflow.reduce((sum, app) => {
      const amount = parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);

    return {
      ...client,
      loan_applications: applicationsWithWorkflow,
      total_applications: totalApplications,
      active_applications: activeApplications,
      approved_loans: approvedLoans,
      total_loan_amount: totalLoanAmount
    };
  };

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client-detail', id],
    queryFn: fetchClientWithApplications,
    enabled: !!id,
    retry: 2,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disbursed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getWorkflowIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-700" />
            <p className="mt-4 text-gray-600">Loading client details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Client</h2>
            <p className="text-red-600">{error?.message || 'Client not found'}</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 md:mb-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
            </Button>
            
            <div className="space-x-3">
              <Link to={`/loan-applications/new?client=${id}`}>
                <Button className="bg-purple-700 hover:bg-purple-800">
                  <FilePlus className="mr-2 h-4 w-4" /> New Loan Application
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center justify-between">
                    Client Information
                    {client.status && (
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Personal Details</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="font-medium">{client.full_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
                        <p className="font-medium">{client.id_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="font-medium">{client.phone_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{client.email || "Not provided"}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                        <p className="font-medium">{client.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Financial Information</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Employment Status</p>
                        <p className="font-medium capitalize">{client.employment_status}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
                        <p className="font-medium">UGX {formatCurrency(client.monthly_income)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Summary Statistics */}
                  {(client.total_applications || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-medium">Loan Portfolio Summary</h3>
                      <Separator className="my-2" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <FileCheck className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <p className="text-2xl font-bold text-blue-600">{client.total_applications}</p>
                          <p className="text-xs text-blue-600">Total Applications</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                          <p className="text-2xl font-bold text-yellow-600">{client.active_applications}</p>
                          <p className="text-xs text-yellow-600">Active</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                          <p className="text-2xl font-bold text-green-600">{client.approved_loans}</p>
                          <p className="text-xs text-green-600">Approved</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                          <p className="text-lg font-bold text-purple-600">
                            UGX {(client.total_loan_amount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-purple-600">Total Value</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium">Record Information</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client Since</p>
                        <p className="font-medium">{format(new Date(client.created_at), 'PPP')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Loan Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {client.loan_applications && client.loan_applications.length > 0 ? (
                    <div className="space-y-4">
                      {client.loan_applications.map((application) => (
                        <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getWorkflowIcon(application.status)}
                                <h4 className="font-medium">{application.loan_type}</h4>
                              </div>
                              <p className="text-lg font-bold text-green-600">
                                UGX {parseFloat(application.loan_amount.replace(/[^0-9.]/g, '')).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Applied: {format(new Date(application.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          
                          {application.workflow_status && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">
                                Current Stage: <span className="font-medium capitalize">{application.current_stage?.replace('_', ' ')}</span>
                              </p>
                              <div className="flex space-x-1">
                                {['field_officer', 'manager', 'director', 'chairperson', 'ceo'].map((stage) => {
                                  const isApproved = application.workflow_status?.[`${stage}_approved` as keyof typeof application.workflow_status];
                                  const isCurrent = application.current_stage === stage;
                                  return (
                                    <div
                                      key={stage}
                                      className={`w-4 h-4 rounded-full ${
                                        isApproved ? 'bg-green-500' : 
                                        isCurrent ? 'bg-yellow-500' : 'bg-gray-300'
                                      }`}
                                      title={`${stage.replace('_', ' ')} ${isApproved ? 'approved' : isCurrent ? 'pending' : 'pending'}`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {application.status === 'rejected' && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                              Rejected: Check application details for reason
                            </div>
                          )}

                          {application.status === 'approved' && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-600">
                              ✓ Application approved and ready for disbursement
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                      <p className="text-gray-500 mt-2">No loan applications yet</p>
                      <Link to={`/loan-applications/new?client=${id}`}>
                        <Button variant="outline" size="sm" className="mt-3">
                          Create First Application
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Live Loan Performance Section */}
          <div className="mt-8">
            <LiveLoanPerformance clientName={client.full_name} />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientDetail;
