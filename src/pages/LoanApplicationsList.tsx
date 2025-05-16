import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FilePlus, Eye, Loader2, AlertTriangle, InfoIcon } from 'lucide-react';
import DataCollectionButton from '@/components/loans/DataCollectionButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LoanApplication {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
  loan_id?: string; // Field for loan ID
  rejection_reason?: string;
  approval_notes?: string;
  original_amount?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending_manager':
    case 'pending_director':
    case 'pending_ceo':
    case 'pending_chairperson':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'downsized':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const LoanApplicationsList = () => {
  const { toast } = useToast();
  const { userRole, isLoading: isLoadingPermissions } = useRolePermissions();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (isLoadingPermissions) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('id, client_name, loan_amount, loan_type, status, created_at, loan_id, rejection_reason, approval_notes, original_amount');

        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          // Ensure we handle the data properly even if some fields are missing
          const safeData = data.map(app => ({
            id: app.id || '',
            client_name: app.client_name || '',
            loan_amount: app.loan_amount || '',
            loan_type: app.loan_type || '',
            status: app.status || '',
            created_at: app.created_at || '',
            loan_id: app.loan_id || 'No ID',
            rejection_reason: app.rejection_reason,
            approval_notes: app.approval_notes,
            original_amount: app.original_amount
          }));
          
          setApplications(safeData);
        } else {
          setApplications([]);
        }
      } catch (error: any) {
        console.error('Error fetching loan applications:', error);
        toast({
          title: 'Failed to load applications',
          description: error.message || 'An error occurred while fetching loan applications',
          variant: 'destructive',
        });
        // Set empty array on error to avoid TypeScript errors
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [toast, isLoadingPermissions]);

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Loan Applications</h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                {userRole === 'field_officer' ? (
                  "Create and manage loan applications. You can view all applications you've submitted."
                ) : userRole === 'manager' ? (
                  "Review loan applications submitted by field officers. You can approve or reject applications."
                ) : userRole === 'director' ? (
                  "Assess risk for loan applications that have been approved by managers."
                ) : userRole === 'ceo' || userRole === 'chairperson' ? (
                  "Make final approval decisions on loan applications that have passed earlier stages."
                ) : (
                  "View and manage loan applications. Click on an application to see its details."
                )}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              {userRole === 'field_officer' && (
                <>
                  <DataCollectionButton />
                  <Button className="bg-purple-700 hover:bg-purple-800" asChild>
                    <Link to="/loan-applications/new">
                      <FilePlus className="mr-2 h-4 w-4" />
                      New Application
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
              <CardDescription>
                {userRole === 'field_officer' ? "Applications you've submitted" : 
                 userRole === 'manager' ? "Applications awaiting your review" :
                 userRole === 'director' ? "Applications awaiting risk assessment" :
                 userRole === 'ceo' || userRole === 'chairperson' ? "Applications awaiting final approval" :
                 "All loan applications"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading || isLoadingPermissions ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-700 mr-3" />
                  <p>Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No loan applications found. 
                    {userRole === 'field_officer' && " Start by creating a new application or collecting client data."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Loan Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-mono">
                            {application.loan_id || 'No ID'}
                          </TableCell>
                          <TableCell className="font-medium">{application.client_name}</TableCell>
                          <TableCell className="capitalize">{application.loan_type}</TableCell>
                          <TableCell>
                            {application.status === 'downsized' && application.original_amount ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center">
                                    <span className="line-through text-gray-500 mr-1">{application.original_amount}</span>
                                    {application.loan_amount} UGX
                                    <AlertTriangle className="h-4 w-4 ml-1 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm">
                                    <p>Loan amount reduced from original request of {application.original_amount} UGX</p>
                                    {application.approval_notes && (
                                      <p className="mt-1 text-xs">{application.approval_notes}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              `${application.loan_amount} UGX`
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(application.status)}`}>
                              {formatStatus(application.status)}
                            </Badge>
                            {application.status === 'rejected' && application.rejection_reason && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="ml-2">
                                    <InfoIcon className="h-4 w-4 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm">
                                    <p>{application.rejection_reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                          <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/loan-applications/${application.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default LoanApplicationsList;
