
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApprovalWorkflow, { WorkflowLoanData } from '@/components/workflow/LoanApprovalWorkflow';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const LoanApprovalPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading: isLoadingPermissions } = useRolePermissions();
  const [loanData, setLoanData] = useState<WorkflowLoanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLoanApplication = async () => {
      if (!id) {
        setError("No application ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error("Application not found");
        }
        
        setLoanData(data as WorkflowLoanData);
      } catch (error: any) {
        console.error('Error fetching loan application:', error);
        setError(error.message || 'Could not load application data');
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

  const handleWorkflowUpdate = async () => {
    // Refresh the loan data after an update
    if (id) {
      try {
        const { data } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('id', id)
          .single();
          
        if (data) {
          setLoanData(data as WorkflowLoanData);
        }
      } catch (error) {
        console.error("Error refreshing loan data:", error);
      }
    }
  };

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
  
  if (error || !id || !loanData) {
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
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center text-red-500 mb-4 text-xl">
                  <AlertTriangle className="h-8 w-8 mr-2" />
                  {error || "Application not found or ID is missing"}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please check the URL or return to the applications list.
                </p>
                <Button asChild>
                  <Link to="/loan-applications">
                    View All Applications
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.section 
        className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link to="/loan-applications">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Applications
              </Link>
            </Button>
          </div>
          
          <motion.div 
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Loan Application Review</h1>
            {loanData && (
              <div className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-4">
                <p><span className="font-medium">Client:</span> {loanData.client_name}</p>
                <p><span className="font-medium">Amount:</span> {loanData.loan_amount.toLocaleString()} UGX</p>
                <p><span className="font-medium">Type:</span> {loanData.loan_type}</p>
                <p><span className="font-medium">Purpose:</span> {loanData.purpose_of_loan || 'Not specified'}</p>
                <p><span className="font-medium">Status:</span> <span className="uppercase font-semibold">{loanData.status}</span></p>
              </div>
            )}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Review and process this loan application according to your role's responsibilities.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LoanApprovalWorkflow 
              loanData={loanData} 
              onWorkflowUpdate={handleWorkflowUpdate}
            />
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
};

export default LoanApprovalPage;
