
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

// Mock API function to fetch loan data
const fetchLoanData = async (id: string): Promise<any> => {
  // In a real application, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        client_id: 'C1001',
        client_name: 'John Doe',
        loan_amount: '25000000', // String in legacy data
        loan_term: '15 years',
        interest_rate: '18.5%',
        address: '123 Main St, Kampala',
        id_number: 'CM1234567',
        employment_status: 'Employed',
        phone: '+256700123456',
        purpose: 'Home purchase',
        approval_notes: null,
        created_by: 'agent@example.com',
        created_at: '2023-10-15T10:30:00Z',
        current_approver: 'manager@example.com',
        current_stage: 'manager_review', // Legacy field
        status: 'pending'
      });
    }, 1000);
  });
};

const LoanApprovalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [userCanApprove, setUserCanApprove] = useState<boolean>(false);
  
  // Fetch loan data
  const { data: rawLoanData, isLoading, error } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => fetchLoanData(id as string)
  });
  
  // Convert to workflow format
  const loanData: WorkflowLoanData | undefined = rawLoanData 
    ? adaptLoanDataToWorkflowFormat(rawLoanData)
    : undefined;
  
  // Check if the current user is allowed to approve this loan
  useEffect(() => {
    if (loanData && user) {
      const isCurrentApprover = loanData.current_approver === user.email;
      setUserCanApprove(isCurrentApprover);
      
      if (!isCurrentApprover) {
        toast({
          title: "Information",
          description: "You are viewing this loan in read-only mode as you are not the current approver.",
        });
      }
    }
  }, [loanData, user, toast]);
  
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
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">Loan Approval: {loanData.client_name}</h1>
        
        {userCanApprove ? (
          <LoanApprovalWorkflow 
            loanData={loanData} 
          />
        ) : (
          <NoActionRequired loanData={loanData} />
        )}
      </div>
    </Layout>
  );
};

export default LoanApprovalPage;
