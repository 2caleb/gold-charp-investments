
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
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !loanData) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> There was a problem loading the loan application.</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          Welcome {userName}
        </h1>
        <h2 className="text-xl mb-8 text-gray-600 dark:text-gray-400">
          Client: {loanData.client_name}
        </h2>
        
        <EnhancedLoanApprovalWorkflow 
          loanData={loanData}
          onWorkflowUpdate={refetch}
        />
      </div>
    </Layout>
  );
};

export default LoanApprovalPage;
