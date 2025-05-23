
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateRejectionReason, generateDownsizingReason } from '@/utils/loanUtils';

// Define valid role types to match the expected type in generateRejectionReason
type RoleType = 'manager' | 'director' | 'ceo' | 'chairperson';

// Helper function to validate role type
const validateRoleType = (role: string | undefined): RoleType => {
  if (!role) return 'manager';
  
  return (['manager', 'director', 'ceo', 'chairperson'].includes(role) 
    ? role as RoleType 
    : 'manager');
};

export function useLoanFunctions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Process a new loan application through the backend
   */
  const processLoanApplication = async (
    loanId: string, 
    clientName: string, 
    loanAmount: string, 
    loanType: string, 
    employmentStatus: string, 
    monthlyIncome: string,
    loanIdentificationNumber: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-loan-application', {
        body: {
          loan_id: loanId,
          client_name: clientName,
          loan_amount: loanAmount,
          loan_type: loanType,
          employment_status: employmentStatus,
          monthly_income: monthlyIncome,
          loan_identification_number: loanIdentificationNumber
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Loan Application Processed',
        description: 'The loan application has been processed successfully.',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error processing loan application:', error);
      toast({
        title: 'Processing Failed',
        description: error.message || 'Failed to process loan application',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approve or reject a loan application
   */
  const handleLoanApproval = async (
    loanId: string, 
    action: 'approve' | 'reject' | 'downsize', 
    notes: string, 
    approverId: string,
    employmentStatus?: string,
    loanAmount?: string,
    downsizedAmount?: string,
    roleType?: string
  ) => {
    setIsLoading(true);
    try {
      // Generate reason if not provided
      let finalNotes = notes;
      
      if (action === 'reject' && !notes && roleType && employmentStatus && loanAmount) {
        // Ensure roleType is a valid RoleType
        const validRoleType = validateRoleType(roleType);
        finalNotes = generateRejectionReason(validRoleType, employmentStatus, loanAmount, '');
      }
      
      if (action === 'downsize' && !notes && loanAmount && downsizedAmount) {
        finalNotes = generateDownsizingReason(loanAmount, downsizedAmount, '');
      }
      
      const { data, error } = await supabase.functions.invoke('loan-approval', {
        body: {
          loan_id: loanId,
          action,
          notes: finalNotes,
          approver_id: approverId,
          downsized_amount: downsizedAmount
        }
      });

      if (error) throw error;
      
      let toastTitle = 'Action Successful';
      let description = data.message;
      
      if (action === 'approve') {
        toastTitle = 'Loan Approved';
      } else if (action === 'reject') {
        toastTitle = 'Loan Rejected';
      } else if (action === 'downsize') {
        toastTitle = 'Loan Amount Adjusted';
      }
      
      toast({
        title: toastTitle,
        description,
      });
      
      return data;
    } catch (error: any) {
      console.error('Error with loan approval:', error);
      toast({
        title: 'Action Failed',
        description: error.message || `Failed to ${action} loan`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate loan repayment schedule
   */
  const calculateRepayment = async (
    principal: number,
    interestRate: number,
    termMonths: number,
    startDate: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-repayment', {
        body: {
          principal,
          interest_rate: interestRate,
          term_months: termMonths,
          start_date: startDate
        }
      });

      if (error) throw error;
      return data.schedule;
    } catch (error: any) {
      console.error('Error calculating repayment:', error);
      toast({
        title: 'Calculation Failed',
        description: error.message || 'Failed to calculate repayment schedule',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a notification to a user
   */
  const sendNotification = async (
    userId: string,
    message: string,
    relatedTo: string,
    entityId: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          user_id: userId,
          message,
          related_to: relatedTo,
          entity_id: entityId
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Notification Failed',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processLoanApplication,
    handleLoanApproval,
    calculateRepayment,
    sendNotification
  };
}
