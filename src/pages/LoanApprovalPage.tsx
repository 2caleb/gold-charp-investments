
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
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

// Fetch loan data from the database
const fetchLoanData = async (id: string): Promise<any> => {
  const { data, error } = await supabase
    .from('loan_applications')
    .select(`
      *,
      loan_application_workflow(*)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container max-w-7xl mx-auto py-12 px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !loanData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container max-w-7xl mx-auto py-12 px-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">There was a problem loading the loan application.</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container max-w-7xl mx-auto py-12 px-4">
          {/* Premium Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
                Welcome {userName}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
            </div>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {loanData.client_name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Loan Application Review
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Application ID</div>
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-300">
                      {loanData.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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
