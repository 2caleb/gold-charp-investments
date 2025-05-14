
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

const LoanApprovalWorkflow = ({ applicationId }: { applicationId: string }) => {
  const { toast } = useToast();
  const { 
    userRole, 
    isFieldOfficer, 
    isManager, 
    isDirector, 
    isCEO, 
    isChairperson 
  } = useRolePermissions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use RPC function to fetch workflow data
        const { data: workflowData, error: workflowError } = await supabase
          .rpc('get_loan_workflow', { application_id: applicationId });

        if (workflowError) throw workflowError;
        
        if (workflowData && workflowData.length > 0) {
          // Since this is an RPC call that returns multiple rows, we want the first one
          setWorkflow(workflowData[0] as unknown as WorkflowData);
        } else {
          throw new Error('No workflow data found');
        }

        // Fetch application data
        const { data: applicationData, error: applicationError } = await supabase
          .from('loan_applications')
          .select('id, client_name, loan_amount, loan_type, purpose_of_loan, status')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;
        setApplication(applicationData);

        // Set initial notes based on current role
        if (workflowData && workflowData.length > 0) {
          const workflow = workflowData[0];
          if (isFieldOfficer && workflow.current_stage === 'field_officer') {
            setNotes(workflow.field_officer_notes || '');
          } else if (isManager && workflow.current_stage === 'manager') {
            setNotes(workflow.manager_notes || '');
          } else if (isDirector && workflow.current_stage === 'director') {
            setNotes(workflow.director_notes || '');
          } else if (isCEO && workflow.current_stage === 'ceo') {
            setNotes(workflow.ceo_notes || '');
          } else if (isChairperson && workflow.current_stage === 'chairperson') {
            setNotes(workflow.chairperson_notes || '');
          }
        }

      } catch (error: any) {
        console.error('Error fetching workflow data:', error);
        toast({
          title: 'Error',
          description: `Failed to load application data: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [applicationId, toast, isFieldOfficer, isManager, isDirector, isCEO, isChairperson]);

  const handleAction = async (approve: boolean) => {
    if (!workflow || !application) return;
    
    setIsSaving(true);
    try {
      // Use RPC for advancing the workflow
      const { data, error } = await supabase.rpc('advance_loan_workflow', {
        _application_id: applicationId,
        _notes: notes,
        _approved: approve
      });

      if (error) throw error;

      // Show success message
      const actionText = approve ? 'approved' : 'rejected';
      toast({
        title: `Application ${actionText}`,
        description: `The loan application has been successfully ${actionText}.`,
      });

      // Refresh data
      const { data: updatedWorkflow, error: refreshError } = await supabase
        .rpc('get_loan_workflow', { application_id: applicationId });
        
      if (refreshError) throw refreshError;
      
      if (updatedWorkflow && updatedWorkflow.length > 0) {
        setWorkflow(updatedWorkflow[0] as unknown as WorkflowData);
      }

      const { data: updatedApplication, error: appError } = await supabase
        .from('loan_applications')
        .select('id, client_name, loan_amount, loan_type, purpose_of_loan, status')
        .eq('id', applicationId)
        .single();
        
      if (appError) throw appError;
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

  if (!workflow || !application) {
    return (
      <div className="p-4 text-red-600">
        No workflow found for this application. The application might not exist or you don't have permission to view it.
      </div>
    );
  }

  // Determine if current user can take action on this application
  const canTakeAction = (
    (isFieldOfficer && workflow.current_stage === 'field_officer') ||
    (isManager && workflow.current_stage === 'manager') ||
    (isDirector && workflow.current_stage === 'director') ||
    (isCEO && workflow.current_stage === 'ceo') ||
    (isChairperson && workflow.current_stage === 'chairperson')
  );

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

          {/* Action section for authorized users */}
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
