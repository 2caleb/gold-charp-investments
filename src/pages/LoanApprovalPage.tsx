
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import EnhancedLoanApprovalWorkflow from '@/components/workflow/EnhancedLoanApprovalWorkflow';
import NoActionRequired from '@/components/workflow/NoActionRequired';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { WorkflowLoanData } from '@/types/workflow';
import { adaptLoanDataToWorkflowFormat } from '@/utils/workflowAdapter';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { supabase } from '@/integrations/supabase/client';

// Fetch loan data from the database - FIXED TABLE NAME
const fetchLoanData = async (id: string): Promise<any> => {
  const { data, error } = await supabase
    .from('loan_applications')
    .select(`
      *,
      loan_applications_workflow(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

const LoanApprovalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole, userName } = useRolePermissions();
  const [userCanApprove, setUserCanApprove] = useState<boolean>(false);
  
  // Fetch loan data
  const { data: rawLoanData, isLoading, error, refetch } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => fetchLoanData(id as string),
    enabled: !!id
  });
  
  // Convert to workflow format
  const loanData: WorkflowLoanData | undefined = rawLoanData 
    ? adaptLoanDataToWorkflowFormat(rawLoanData)
    : undefined;
  
  // Check if the current user is allowed to approve this loan
  useEffect(() => {
    if (loanData && user) {
      const currentStage = loanData.workflow_stage || '';
      
      const canApprove = (
        (currentStage === 'field_officer' && userRole === 'field_officer') ||
        (currentStage === 'manager' && userRole === 'manager') ||
        (currentStage === 'director' && userRole === 'director') ||
        (currentStage === 'chairperson' && userRole === 'chairperson') ||
        (currentStage === 'ceo' && userRole === 'ceo')
      );
      
      setUserCanApprove(canApprove);
    }
  }, [loanData, user, userRole]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
          <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-center items-center h-96">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-sm opacity-75 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !loanData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
          <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-8 py-6 rounded-2xl shadow-lg backdrop-blur-sm" role="alert">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Error Loading Application</h3>
                    <p className="text-sm opacity-90">There was a problem loading the loan application. Please try again or contact support.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="container max-w-7xl mx-auto py-8 px-4">
          {/* Premium Welcome Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Welcome {userName}
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-6 font-medium">
              Premium Loan Application Review System
            </p>
          </div>
          
          <EnhancedLoanApprovalWorkflow 
            loanData={loanData}
            onWorkflowUpdate={refetch}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LoanApprovalPage;
