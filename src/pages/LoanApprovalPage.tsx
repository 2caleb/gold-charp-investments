
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApprovalWorkflow from '@/components/workflow/LoanApprovalWorkflow';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanApplicationData {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  status: string;
  created_at: string;
}

const LoanApprovalPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading: isLoadingPermissions } = useRolePermissions();
  const [application, setApplication] = useState<LoanApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLoanApplication = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setApplication(data);
      } catch (error: any) {
        console.error('Error fetching loan application:', error);
        toast({
          title: 'Error fetching application',
          description: error.message || 'Could not load application data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanApplication();
  }, [id, toast]);

  if (isLoadingPermissions || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-700 mb-4" />
            <p>{isLoadingPermissions ? 'Loading permissions...' : 'Loading application data...'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link to="/loan-applications">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Applications
              </Link>
            </Button>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Loan Application Review</h1>
            {application && (
              <div className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-4">
                <p><span className="font-medium">Client:</span> {application.client_name}</p>
                <p><span className="font-medium">Amount:</span> {parseFloat(application.loan_amount).toLocaleString()} UGX</p>
                <p><span className="font-medium">Type:</span> {application.loan_type}</p>
                <p><span className="font-medium">Status:</span> {application.status.toUpperCase()}</p>
              </div>
            )}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Review and process this loan application according to your role's responsibilities.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            {id ? (
              <LoanApprovalWorkflow applicationId={id} />
            ) : (
              <p className="text-red-500">No application ID provided.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoanApprovalPage;
