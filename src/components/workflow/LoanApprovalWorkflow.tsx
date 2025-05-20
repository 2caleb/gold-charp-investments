
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { WorkflowData } from '@/types/notification';

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
  created_at: string;
  updated_at: string;
}

const LoanApprovalWorkflow = ({ applicationId }: { applicationId: string }) => {
  const { toast } = useToast();
  const { userRole } = useRolePermissions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          .functions
          .invoke('get_loan_workflow', {
            body: { application_id: applicationId }
          });

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
    if (!workflow || !application) return;
    
    setIsSaving(true);
    try {
      // Use loan-approval edge function instead of direct update
      const { data: updatedWorkflow, error } = await supabase
        .functions
        .invoke('loan-approval', {
          body: {
            workflowId: workflow.id,
            applicationId,
            stage: workflow.current_stage,
            approved: approve,
            notes,
          }
        });

      if (error) throw error;

      // Show success message
      const actionText = approve ? 'approved' : 'rejected';
      toast({
        title: `Application ${actionText}`,
        description: `The loan application has been successfully ${actionText}.`,
      });

      // Update local state with the response data
      if (updatedWorkflow) {
        setWorkflow(updatedWorkflow as WorkflowResponse);
      }

      // Refresh application data
      const { data: updatedApplication, error: appFetchError } = await supabase
        .from('loan_applications')
        .select('id, client_name, loan_amount, loan_type, purpose_of_loan, status')
        .eq('id', applicationId)
        .single();
        
      if (appFetchError) throw appFetchError;
      if (updatedApplication) setApplication(updatedApplication);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
        <span className="ml-2">Loading workflow data...</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact the system administrator.</p>
        </CardContent>
      </Card>
    );
  }

  if (!workflow || !application) {
    return (
      <div className="p-4 text-red-600">
        No workflow found for this application. The application might not exist or you don't have permission to view it.
      </div>
    );
  }

  // All authenticated users can take action now
  const canTakeAction = true;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Loan Application Workflow</CardTitle>
        <CardDescription>
          Application status: <span className="font-semibold">{application.status}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Application details */}
          <div>
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
          </div>

          {/* Workflow status */}
          <div>
            <h3 className="text-lg font-medium">Approval Status</h3>
            <Separator className="my-2" />
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${workflow.field_officer_approved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Field Officer: {workflow.field_officer_approved ? 'Approved' : 'Pending'}</span>
              </li>
              <li className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${workflow.manager_approved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Manager: {workflow.manager_approved ? 'Approved' : 'Pending'}</span>
              </li>
              <li className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${workflow.director_approved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Director: {workflow.director_approved ? 'Approved' : 'Pending'}</span>
              </li>
              <li className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${workflow.ceo_approved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>CEO: {workflow.ceo_approved ? 'Approved' : 'Pending'}</span>
              </li>
              <li className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${workflow.chairperson_approved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Chairperson: {workflow.chairperson_approved ? 'Approved' : 'Pending'}</span>
              </li>
            </ul>
          </div>

          {/* Notes from previous reviewers */}
          <div>
            <h3 className="text-lg font-medium">Review Notes</h3>
            <Separator className="my-2" />
            <div className="space-y-2">
              {workflow.field_officer_notes && (
                <div>
                  <p className="text-sm font-medium">Field Officer Notes:</p>
                  <p className="text-sm">{workflow.field_officer_notes}</p>
                </div>
              )}
              {workflow.manager_notes && (
                <div>
                  <p className="text-sm font-medium">Manager Notes:</p>
                  <p className="text-sm">{workflow.manager_notes}</p>
                </div>
              )}
              {workflow.director_notes && (
                <div>
                  <p className="text-sm font-medium">Director Notes:</p>
                  <p className="text-sm">{workflow.director_notes}</p>
                </div>
              )}
              {workflow.ceo_notes && (
                <div>
                  <p className="text-sm font-medium">CEO Notes:</p>
                  <p className="text-sm">{workflow.ceo_notes}</p>
                </div>
              )}
              {workflow.chairperson_notes && (
                <div>
                  <p className="text-sm font-medium">Chairperson Notes:</p>
                  <p className="text-sm">{workflow.chairperson_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action section for all users */}
          {canTakeAction && (
            <div className="mt-6">
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
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {canTakeAction && (
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            variant="destructive" 
            onClick={() => handleAction(false)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reject
          </Button>
          <Button 
            variant="default" 
            onClick={() => handleAction(true)}
            disabled={isSaving}
            className="bg-purple-700 hover:bg-purple-800"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default LoanApprovalWorkflow;
