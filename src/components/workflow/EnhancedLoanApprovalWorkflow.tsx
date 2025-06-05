
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AnimatedWorkflowStatus from './AnimatedWorkflowStatus';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowProps {
  applicationId: string;
}

interface LoanApplication {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  purpose_of_loan: string;
  status: string;
  monthly_income: number;
  employment_status: string;
  phone_number: string;
  address: string;
  id_number: string;
  current_approver: string;
  created_at: string;
  approval_notes?: string;
  rejection_reason?: string;
}

interface WorkflowStage {
  id: string;
  loan_application_id: string;
  current_stage: string;
  field_officer_approved: boolean | null;
  manager_approved: boolean | null;
  director_approved: boolean | null;
  ceo_approved: boolean | null;
  chairperson_approved: boolean | null;
  field_officer_notes: string | null;
  manager_notes: string | null;
  director_notes: string | null;
  ceo_notes: string | null;
  chairperson_notes: string | null;
  created_at: string;
  updated_at: string;
}

const EnhancedLoanApprovalWorkflow: React.FC<WorkflowProps> = ({ applicationId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole } = useRolePermissions();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [finalResult, setFinalResult] = useState<'SUCCESSFUL' | 'FAILED' | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  // Fetch loan application details
  const { data: application, isLoading: appLoading, error: appError } = useQuery({
    queryKey: ['loan-application', applicationId],
    queryFn: async () => {
      console.log('Fetching application:', applicationId);
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('id', applicationId)
        .single();
      
      if (error) {
        console.error('Application fetch error:', error);
        throw new Error(`Failed to load application: ${error.message}`);
      }
      return data as LoanApplication;
    },
  });

  // Fetch workflow stages with improved error handling
  const { data: workflow, isLoading: workflowLoading, error: workflowLoadError } = useQuery({
    queryKey: ['loan-workflow', applicationId],
    queryFn: async () => {
      console.log('Fetching workflow for:', applicationId);
      const { data, error } = await supabase
        .from('loan_applications_workflow')
        .select('*')
        .eq('loan_application_id', applicationId)
        .maybeSingle();
      
      if (error) {
        console.error('Workflow fetch error:', error);
        throw new Error(`Failed to load workflow: ${error.message}`);
      }
      
      // If no workflow exists, create one
      if (!data) {
        console.log('No workflow found, creating new one');
        const { data: newWorkflow, error: createError } = await supabase
          .from('loan_applications_workflow')
          .insert({
            loan_application_id: applicationId,
            current_stage: 'manager',
            field_officer_approved: true,
            field_officer_notes: 'Application submitted by field officer'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Workflow creation error:', createError);
          throw new Error(`Failed to create workflow: ${createError.message}`);
        }
        return newWorkflow as WorkflowStage;
      }
      return data as WorkflowStage;
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Helper function to safely convert notes to string
  const getNotesAsString = (notes: string | null | undefined): string => {
    if (!notes) return 'No notes';
    return notes;
  };

  // Mutation for workflow actions
  const workflowMutation = useMutation({
    mutationFn: async ({ action, notes: actionNotes }: { action: 'approve' | 'reject', notes: string }) => {
      if (!userRole || !workflow) {
        throw new Error('Missing required data for workflow action');
      }

      setIsProcessing(true);
      
      try {
        const response = await fetch('/api/loan-approval', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loan_id: applicationId,
            action,
            notes: actionNotes || notes,
            approver_id: user?.id
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process workflow action');
        }

        const result = await response.json();
        return result;
      } catch (error: any) {
        console.error('Workflow mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      
      // Show animated result for CEO decisions
      if (data.isFinalDecision && data.finalResult) {
        setFinalResult(data.finalResult);
        setShowFinalResult(true);
        
        // Hide the result after 3 seconds
        setTimeout(() => {
          setShowFinalResult(false);
          setFinalResult(null);
        }, 3000);
      }
      
      toast({
        title: `Application ${data.action}d`,
        description: data.isFinalDecision 
          ? `Final decision: Application ${data.action}d by CEO`
          : `The loan application has been ${data.action}d successfully.`,
        variant: data.action === 'approve' ? 'default' : 'destructive'
      });
      
      queryClient.invalidateQueries({ queryKey: ['loan-application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['loan-workflow', applicationId] });
      setNotes('');
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error('Workflow action error:', error);
      setWorkflowError(error.message);
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process the application',
        variant: 'destructive'
      });
    }
  });

  const getStageIcon = (stage: string, approved: boolean | null) => {
    if (approved === true) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (approved === false) return <XCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStageStatus = (stage: string, approved: boolean | null) => {
    if (approved === true) return 'Approved';
    if (approved === false) return 'Rejected';
    return 'Pending';
  };

  const canTakeAction = () => {
    if (!workflow || !userRole) return false;
    
    const stageRoleMap = {
      'manager': workflow.current_stage === 'manager',
      'director': workflow.current_stage === 'director',
      'chairperson': workflow.current_stage === 'chairperson',
      'ceo': workflow.current_stage === 'ceo'
    };

    return stageRoleMap[userRole as keyof typeof stageRoleMap] || false;
  };

  if (appLoading || workflowLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading application details...</span>
      </div>
    );
  }

  if (appError || !application) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Failed to load application details: {appError?.message || 'Unknown error'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workflowLoadError || workflowError) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Workflow Error: {workflowLoadError?.message || workflowError}</span>
          </div>
          <Button 
            onClick={() => {
              setWorkflowError(null);
              queryClient.invalidateQueries({ queryKey: ['loan-workflow', applicationId] });
            }}
            variant="outline"
          >
            Retry Loading Workflow
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center text-yellow-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>Creating workflow for this application...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Animated Final Result Overlay */}
      <AnimatePresence>
        {showFinalResult && finalResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                opacity: 1,
                rotate: finalResult === 'SUCCESSFUL' ? [0, 5, -5, 0] : [0, -2, 2, 0]
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`text-center p-8 rounded-lg ${
                finalResult === 'SUCCESSFUL' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            >
              <motion.h1
                animate={finalResult === 'SUCCESSFUL' 
                  ? { scale: [1, 1.1, 1] }
                  : { x: [-10, 10, -10, 0] }
                }
                transition={{ 
                  repeat: finalResult === 'SUCCESSFUL' ? 2 : 1,
                  duration: finalResult === 'SUCCESSFUL' ? 0.6 : 0.4
                }}
                className={`text-6xl font-black text-white mb-4 ${
                  finalResult === 'SUCCESSFUL' ? 'drop-shadow-lg' : 'drop-shadow-md'
                }`}
              >
                {finalResult}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white text-xl"
              >
                {finalResult === 'SUCCESSFUL' 
                  ? '🎉 Loan Application Approved!' 
                  : '❌ Loan Application Rejected'
                }
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Client Name:</span>
              <p className="text-lg">{application.client_name}</p>
            </div>
            <div>
              <span className="font-medium">Loan Amount:</span>
              <p className="text-lg text-green-600 font-semibold">{application.loan_amount} UGX</p>
            </div>
            <div>
              <span className="font-medium">Loan Type:</span>
              <p className="text-lg capitalize">{application.loan_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium">Purpose:</span>
              <p className="text-lg">{application.purpose_of_loan}</p>
            </div>
            <div>
              <span className="font-medium">Monthly Income:</span>
              <p className="text-lg">{application.monthly_income.toLocaleString()} UGX</p>
            </div>
            <div>
              <span className="font-medium">Employment:</span>
              <p className="text-lg capitalize">{application.employment_status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Progress - CORRECTED ORDER */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflow</CardTitle>
          <Badge className={`w-fit ${
            application.status === 'approved' ? 'bg-green-500' :
            application.status === 'rejected' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}>
            {application.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Field Officer */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStageIcon('field_officer', workflow.field_officer_approved)}
                <div>
                  <p className="font-medium">Field Officer Review</p>
                  <p className="text-sm text-gray-600">{getNotesAsString(workflow.field_officer_notes)}</p>
                </div>
              </div>
              <Badge variant="outline">
                {getStageStatus('field_officer', workflow.field_officer_approved)}
              </Badge>
            </motion.div>

            {/* Manager */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStageIcon('manager', workflow.manager_approved)}
                <div>
                  <p className="font-medium">Manager Review</p>
                  <p className="text-sm text-gray-600">{getNotesAsString(workflow.manager_notes)}</p>
                </div>
              </div>
              <Badge variant="outline">
                {getStageStatus('manager', workflow.manager_approved)}
              </Badge>
            </motion.div>

            {/* Director */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStageIcon('director', workflow.director_approved)}
                <div>
                  <p className="font-medium">Director Risk Assessment</p>
                  <p className="text-sm text-gray-600">{getNotesAsString(workflow.director_notes)}</p>
                </div>
              </div>
              <Badge variant="outline">
                {getStageStatus('director', workflow.director_approved)}
              </Badge>
            </motion.div>

            {/* Chairperson - NOW BEFORE CEO */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStageIcon('chairperson', workflow.chairperson_approved)}
                <div>
                  <p className="font-medium">Chairperson Approval</p>
                  <p className="text-sm text-gray-600">{getNotesAsString(workflow.chairperson_notes)}</p>
                </div>
              </div>
              <Badge variant="outline">
                {getStageStatus('chairperson', workflow.chairperson_approved)}
              </Badge>
            </motion.div>

            {/* CEO - FINAL APPROVAL */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200"
            >
              <div className="flex items-center space-x-3">
                {getStageIcon('ceo', workflow.ceo_approved)}
                <div>
                  <p className="font-medium text-blue-700">CEO Final Decision</p>
                  <p className="text-sm text-gray-600">{getNotesAsString(workflow.ceo_notes)}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-500 text-blue-700">
                {getStageStatus('ceo', workflow.ceo_approved)}
              </Badge>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      {canTakeAction() && (
        <Card>
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
            <p className="text-sm text-gray-600">
              {userRole === 'ceo' ? 'Final decision as CEO' : `Review as ${userRole}`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add your notes or comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => workflowMutation.mutate({ action: 'approve', notes })}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                onClick={() => workflowMutation.mutate({ action: 'reject', notes })}
                disabled={isProcessing}
                variant="destructive"
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLoanApprovalWorkflow;
