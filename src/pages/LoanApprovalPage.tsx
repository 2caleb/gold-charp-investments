
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import LoanApprovalWorkflow from '@/components/workflow/LoanApprovalWorkflow';
import NoActionRequired from '@/components/workflow/NoActionRequired';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { WorkflowLoanData } from '@/types/workflow';
import { adaptLoanDataToWorkflowFormat, getWorkflowStage } from '@/utils/workflowAdapter';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle } from 'lucide-react';

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
  const [notificationShown, setNotificationShown] = useState(false);
  const [showApprovedAnimation, setShowApprovedAnimation] = useState(false);
  const [showRejectedAnimation, setShowRejectedAnimation] = useState(false);
  
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
    if (loanData && user && !notificationShown) {
      const currentStage = loanData.workflow_stage || '';
      
      let canApprove = false;
      
      if (currentStage === 'field_officer' && userRole === 'field_officer') {
        canApprove = true;
      } else if (currentStage === 'manager' && userRole === 'manager') {
        canApprove = true;
      } else if (currentStage === 'director' && userRole === 'director') {
        canApprove = true;
      } else if (currentStage === 'chairperson' && userRole === 'chairperson') {
        canApprove = true;
      } else if (currentStage === 'ceo' && userRole === 'ceo') {
        canApprove = true;
      }
      
      setUserCanApprove(canApprove);
      
      if (!canApprove) {
        toast({
          title: "Read-Only Mode",
          description: "You are viewing this loan in read-only mode as you are not authorized for the current approval stage.",
        });
        setNotificationShown(true);
      }
    }
  }, [loanData, user, toast, userRole, notificationShown]);

  // Show animation when loan status changes
  useEffect(() => {
    if (loanData) {
      if (loanData.status === 'approved') {
        setShowApprovedAnimation(true);
        setTimeout(() => setShowApprovedAnimation(false), 3000);
      } else if (loanData.status === 'rejected') {
        setShowRejectedAnimation(true);
        setTimeout(() => setShowRejectedAnimation(false), 3000);
      }
    }
  }, [loanData?.status]);
  
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
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">Welcome {userName}</h1>
        <h2 className="text-xl mb-8 text-gray-600 dark:text-gray-400">Client: {loanData.client_name}</h2>
        
        {/* Status animations */}
        {showApprovedAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center animate-scale-in">
              <CheckCircle2 className="h-24 w-24 text-green-500 animate-pulse mb-4" />
              <h2 className="text-2xl font-bold text-green-700">SUCCESSFUL</h2>
              <p>The loan application has been approved!</p>
            </div>
          </div>
        )}
        
        {showRejectedAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center animate-scale-in">
              <XCircle className="h-24 w-24 text-red-500 animate-pulse mb-4" />
              <h2 className="text-2xl font-bold text-red-700">FAILED</h2>
              <p>The loan application has been rejected.</p>
            </div>
          </div>
        )}
        
        {userCanApprove ? (
          <LoanApprovalWorkflow 
            loanData={loanData}
            onWorkflowUpdate={refetch}
          />
        ) : (
          <Card className="p-6">
            <NoActionRequired 
              loanData={loanData}
              message={`This loan is currently at the ${loanData.workflow_stage?.replace('_', ' ')} stage. 
                       You are viewing in read-only mode as your role (${userRole}) is not authorized for this stage.`}
            />
            <div className="mt-4">
              <LoanApprovalWorkflow 
                loanData={loanData}
              />
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default LoanApprovalPage;
