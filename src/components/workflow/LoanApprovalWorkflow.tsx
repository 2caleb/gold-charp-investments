
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Check, X, AlertTriangle, CheckCircle2, User, UserCheck, UserX } from 'lucide-react';
import { WorkflowData } from '@/types/notification';
import { motion } from 'framer-motion';
import InstallmentCalculator from '../loans/InstallmentCalculator';

interface LoanApplication {
  id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  purpose_of_loan: string;
  status: string;
}

// Define the structure of the workflow data returned from the database
interface WorkflowResponse {
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
  field_officer_name: string | null;
  manager_name: string | null;
  director_name: string | null;
  ceo_name: string | null;
  chairperson_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ApproverInfo {
  stage: string;
  label: string;
  approved: boolean | null;
  notes: string | null;
  approverName: string | null;
}

const LoanApprovalWorkflow = ({ applicationId }: { applicationId: string }) => {
  const { toast } = useToast();
  const { userRole, userName } = useRolePermissions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [approvers, setApprovers] = useState<ApproverInfo[]>([]);

  useEffect(() => {
    if (!applicationId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        // Fetch application data first
        const { data: applicationData, error: applicationError } = await supabase
          .from('loan_applications')
          .select('id, client_name, loan_amount, loan_type, purpose_of_loan, status')
          .eq('id', applicationId)
          .single();

        if (applicationError) {
          throw new Error(`Failed to load application: ${applicationError.message}`);
        }
        
        setApplication(applicationData);

        // Use the edge function to get workflow data
        const { data: workflowData, error: workflowError } = await supabase
          .from('loan_application_workflow')
          .select('*')
          .eq('loan_application_id', applicationId)
          .single();

        if (workflowError) {
          throw new Error(`Failed to load workflow: ${workflowError.message}`);
        }
        
        if (workflowData) {
          setWorkflow(workflowData as WorkflowResponse);
          
          // Set initial notes based on current role if available
          if (workflowData.current_stage && userRole) {
            const notesKey = `${workflowData.current_stage}_notes` as keyof WorkflowResponse;
            const currentNotes = workflowData[notesKey] as string | null;
            setNotes(currentNotes || '');
          }

          // Construct approver info
          const approversInfo: ApproverInfo[] = [
            { 
              stage: 'field_officer', 
              label: 'Field Officer', 
              approved: workflowData.field_officer_approved,
              notes: workflowData.field_officer_notes,
              approverName: workflowData.field_officer_name || 'Field Officer'
            },
            { 
              stage: 'manager', 
              label: 'Manager', 
              approved: workflowData.manager_approved,
              notes: workflowData.manager_notes,
              approverName: workflowData.manager_name || 'Manager'
            },
            { 
              stage: 'director', 
              label: 'Director', 
              approved: workflowData.director_approved,
              notes: workflowData.director_notes,
              approverName: workflowData.director_name || 'Director'
            },
            { 
              stage: 'ceo', 
              label: 'CEO', 
              approved: workflowData.ceo_approved,
              notes: workflowData.ceo_notes,
              approverName: workflowData.ceo_name || 'CEO'
            },
            { 
              stage: 'chairperson', 
              label: 'Chairperson', 
              approved: workflowData.chairperson_approved,
              notes: workflowData.chairperson_notes,
              approverName: workflowData.chairperson_name || 'Chairperson'
            },
          ];
          setApprovers(approversInfo);
        }
      } catch (error: any) {
        console.error('Error fetching workflow data:', error);
        setErrorMessage(`Failed to load workflow data: ${error.message}`);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load application data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [applicationId, toast, userRole]);

  const handleAction = async (approve: boolean) => {
    if (!workflow || !application || !userName) return;
    
    setIsSaving(true);
    try {
      // Use loan-approval edge function instead of direct update
      const nameField = `${workflow.current_stage}_name`;
      const approvedField = `${workflow.current_stage}_approved`;
      const notesField = `${workflow.current_stage}_notes`;
      
      // Determine next stage
      let nextStage = null;
      if (approve) {
        const stages = ['field_officer', 'manager', 'director', 'ceo', 'chairperson'];
        const currentIndex = stages.indexOf(workflow.current_stage);
        if (currentIndex < stages.length - 1) {
          nextStage = stages[currentIndex + 1];
        }
      }
      
      // Update the workflow with approver name
      const updateData: any = {
        [approvedField]: approve,
        [notesField]: notes,
        [nameField]: userName
      };
      
      if (nextStage) {
        updateData.current_stage = nextStage;
      }
      
      const { data: updatedWorkflow, error: workflowError } = await supabase
        .from('loan_application_workflow')
        .update(updateData)
        .eq('id', workflow.id)
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Update application status
      let applicationStatus = approve ? 
        (nextStage ? `pending_${nextStage}` : 'approved') : 
        'rejected';
        
      // If CEO rejects, mark as final rejection
      if (!approve && workflow.current_stage === 'ceo') {
        applicationStatus = 'rejected_final';
      }
      
      const { data: updatedApplication, error: applicationError } = await supabase
        .from('loan_applications')
        .update({ 
          status: applicationStatus,
          ...(approve ? {} : { rejection_reason: notes }),
          last_updated: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Show success animation
      if (approve) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
      }

      // Show success message
      const actionText = approve ? 'approved' : 'rejected';
      toast({
        title: `Application ${actionText}`,
        description: `The loan application has been successfully ${actionText}.`,
      });

      // Update local state with the response data
      if (updatedWorkflow) {
        setWorkflow(updatedWorkflow as WorkflowResponse);
        
        // Update approvers info
        const updatedApprovers = [...approvers];
        const index = updatedApprovers.findIndex(a => a.stage === workflow.current_stage);
        if (index !== -1) {
          updatedApprovers[index] = {
            ...updatedApprovers[index],
            approved: approve,
            notes: notes,
            approverName: userName
          };
        }
        setApprovers(updatedApprovers);
      }

      // Update application state
      setApplication(updatedApplication);

    } catch (error: any) {
      console.error('Error processing action:', error);
      toast({
        title: 'Error',
        description: `Failed to process your action: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if current role can take action based on workflow stage
  const canTakeAction = () => {
    if (!workflow || !userRole) return false;
    
    // If CEO has rejected, no one can take action
    if (workflow.ceo_approved === false) return false;
    
    // Check if current user's role matches the current workflow stage
    return userRole === workflow.current_stage;
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center p-8"
      >
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
        <span className="ml-2">Loading workflow data...</span>
      </motion.div>
    );
  }

  if (errorMessage) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2" />
              Error
            </CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact the system administrator.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!workflow || !application) {
    return (
      <div className="p-4 text-red-600">
        No workflow found for this application. The application might not exist or you don't have permission to view it.
      </div>
    );
  }

  // Check if user can take action
  const userCanTakeAction = canTakeAction();

  return (
    <Card className="w-full overflow-hidden relative">
      {showSuccessAnimation && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center bg-green-50/90 z-10 backdrop-blur-sm"
        >
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-4 flex justify-center"
            >
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </motion.div>
            <motion.h2 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-3xl font-bold text-green-700"
            >
              SUCCESSFUL
            </motion.h2>
            <p className="text-green-600 mt-2">Application has been approved!</p>
          </div>
        </motion.div>
      )}
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <CardHeader>
          <CardTitle>Loan Application Workflow</CardTitle>
          <CardDescription>
            Application status: <span className="font-semibold">{application.status}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Application details */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-lg font-medium">Application Details</h3>
              <Separator className="my-2" />
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                  <dd>{application.client_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
                  <dd>{application.loan_amount} UGX</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                  <dd className="capitalize">{application.loan_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd>{application.purpose_of_loan}</dd>
                </div>
              </dl>
            </motion.div>

            {/* Loan Calculator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <InstallmentCalculator initialAmount={application.loan_amount} className="my-4" />
            </motion.div>

            {/* Workflow status */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-medium">Approval Status</h3>
              <Separator className="my-2" />
              <ul className="space-y-3">
                {approvers.map((item, index) => (
                  <motion.li 
                    key={item.stage}
                    className="flex items-center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    {item.approved === true ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                        <UserCheck className="h-4 w-4 text-white" />
                      </div>
                    ) : item.approved === false ? (
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mr-2">
                        <UserX className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <span className={workflow.current_stage === item.stage ? 'font-bold' : ''}>
                        {item.label}: {item.approved ? 'Approved' : item.approved === false ? 'Rejected' : 'Pending'}
                      </span>
                      {item.approved !== null && (
                        <span className="ml-2 text-sm text-gray-600">
                          by {item.approverName || 'Unknown'}
                        </span>
                      )}
                      {workflow.current_stage === item.stage && (
                        <span className="ml-2 inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Notes from previous reviewers */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-medium">Review Notes</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                {approvers.filter(item => item.notes).map((item, index) => (
                  <motion.div 
                    key={item.stage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 bg-gray-50 rounded-md"
                  >
                    <p className="text-sm font-medium">{item.label} Notes (by {item.approverName}):</p>
                    <p className="text-sm">{item.notes}</p>
                  </motion.div>
                ))}
                
                {!approvers.some(item => item.notes) && (
                  <p className="text-sm italic text-gray-500">No review notes have been added yet.</p>
                )}
              </div>
            </motion.div>

            {/* Action section for users who can take action */}
            {userCanTakeAction && workflow.ceo_approved !== false && (
              <motion.div 
                className="mt-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-lg font-medium">Take Action</h3>
                <Separator className="my-2" />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">Add your review notes:</p>
                    <Textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Enter your assessment notes here..."
                      rows={4}
                      className="transition-all focus:border-purple-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {workflow.ceo_approved === false && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md"
              >
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-medium">Application Rejected by CEO</h3>
                </div>
                <p className="text-red-600 mt-2">
                  This application has been rejected by the CEO and cannot be reviewed further.
                </p>
                {workflow.ceo_notes && (
                  <div className="mt-2 p-2 bg-white/50 rounded">
                    <p className="text-sm font-medium">Rejection reason:</p>
                    <p className="text-sm">{workflow.ceo_notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </CardContent>

        {userCanTakeAction && workflow.ceo_approved !== false && (
          <CardFooter className="flex justify-end space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="destructive" 
                onClick={() => handleAction(false)}
                disabled={isSaving}
                className="transition-all duration-300"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                Reject
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="default" 
                onClick={() => handleAction(true)}
                disabled={isSaving}
                className="bg-purple-700 hover:bg-purple-800 transition-all duration-300"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Approve
              </Button>
            </motion.div>
          </CardFooter>
        )}
      </motion.div>
    </Card>
  );
};

export default LoanApprovalWorkflow;
