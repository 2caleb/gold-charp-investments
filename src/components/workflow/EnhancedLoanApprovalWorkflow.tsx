
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
        throw error;
      }
      return data as LoanApplication;
    },
  });

  // Fetch workflow stages
  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ['loan-workflow', applicationId],
    queryFn: async () => {
      console.log('Fetching workflow for:', applicationId);
      const { data, error } = await supabase
        .from('loan_applications_workflow')
        .select('*')
        .eq('loan_application_id', applicationId)
        .single();
      
      if (error) {
        console.error('Workflow fetch error:', error);
        // Create workflow if it doesn't exist
        const { data: newWorkflow, error: createError } = await supabase
          .from('loan_applications_workflow')
          .insert({
            loan_application_id: applicationId,
            current_stage: 'manager',
            field_officer_approved: true,
            field_officer_notes: 'Application submitted'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Workflow creation error:', createError);
          throw createError;
        }
        return newWorkflow as WorkflowStage;
      }
      return data as WorkflowStage;
    },
  });

  // Mutation for workflow actions
  const workflowMutation = useMutation({
    mutationFn: async ({ action, notes: actionNotes }: { action: 'approve' | 'reject', notes: string }) => {
      setIsProcessing(true);
      
      const roleMap = {
        'manager': { approved: 'manager_approved', notes: 'manager_notes', nextStage: 'director' },
        'director': { approved: 'director_approved', notes: 'director_notes', nextStage: 'ceo' },
        'ceo': { approved: 'ceo_approved', notes: 'ceo_notes', nextStage: 'chairperson' },
        'chairperson': { approved: 'chairperson_approved', notes: 'chairperson_notes', nextStage: 'completed' }
      };

      const currentRole = userRole;
      const roleConfig = roleMap[currentRole as keyof typeof roleMap];

      if (!roleConfig) {
        throw new Error('Invalid role for this action');
      }

      const updates: any = {
        [roleConfig.approved]: action === 'approve',
        [roleConfig.notes]: actionNotes || notes,
        updated_at: new Date().toISOString()
      };

      if (action === 'approve') {
        updates.current_stage = roleConfig.nextStage;
      } else {
        updates.current_stage = 'rejected';
      }

      // Update workflow
      const { error: workflowError } = await supabase
        .from('loan_applications_workflow')
        .update(updates)
        .eq('loan_application_id', applicationId);

      if (workflowError) throw workflowError;

      // Update main application status
      const newStatus = action === 'approve' 
        ? (roleConfig.nextStage === 'completed' ? 'approved' : `pending_${roleConfig.nextStage}`)
        : 'rejected';

      const appUpdates: any = {
        status: newStatus,
        last_updated: new Date().toISOString()
      };

      if (action === 'approve') {
        appUpdates.approval_notes = actionNotes || notes;
      } else {
        appUpdates.rejection_reason = actionNotes || notes;
      }

      const { error: appError } = await supabase
        .from('loan_applications')
        .update(appUpdates)
        .eq('id', applicationId);

      if (appError) throw appError;

      // Log workflow action
      await supabase
        .from('loan_workflow_log')
        .insert({
          loan_application_id: applicationId,
          action: action === 'approve' ? `Approved by ${currentRole}` : `Rejected by ${currentRole}`,
          performed_by: user?.id || '',
          status: newStatus
        });

      return { action, newStatus };
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: `Application ${data.action}d`,
        description: `The loan application has been ${data.action}d successfully.`,
        variant: data.action === 'approve' ? 'default' : 'destructive'
      });
      queryClient.invalidateQueries({ queryKey: ['loan-application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['loan-workflow', applicationId] });
      setNotes('');
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error('Workflow action error:', error);
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
      'ceo': workflow.current_stage === 'ceo',
      'chairperson': workflow.current_stage === 'chairperson'
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
            <span>Failed to load application details. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Workflow Progress */}
      {workflow && (
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
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStageIcon('field_officer', workflow.field_officer_approved)}
                  <div>
                    <p className="font-medium">Field Officer Review</p>
                    <p className="text-sm text-gray-600">{workflow.field_officer_notes || 'No notes'}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {getStageStatus('field_officer', workflow.field_officer_approved)}
                </Badge>
              </div>

              {/* Manager */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStageIcon('manager', workflow.manager_approved)}
                  <div>
                    <p className="font-medium">Manager Review</p>
                    <p className="text-sm text-gray-600">{workflow.manager_notes || 'No notes'}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {getStageStatus('manager', workflow.manager_approved)}
                </Badge>
              </div>

              {/* Director */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStageIcon('director', workflow.director_approved)}
                  <div>
                    <p className="font-medium">Director Risk Assessment</p>
                    <p className="text-sm text-gray-600">{workflow.director_notes || 'No notes'}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {getStageStatus('director', workflow.director_approved)}
                </Badge>
              </div>

              {/* CEO */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStageIcon('ceo', workflow.ceo_approved)}
                  <div>
                    <p className="font-medium">CEO Approval</p>
                    <p className="text-sm text-gray-600">{workflow.ceo_notes || 'No notes'}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {getStageStatus('ceo', workflow.ceo_approved)}
                </Badge>
              </div>

              {/* Chairperson */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStageIcon('chairperson', workflow.chairperson_approved)}
                  <div>
                    <p className="font-medium">Chairperson Final Approval</p>
                    <p className="text-sm text-gray-600">{workflow.chairperson_notes || 'No notes'}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {getStageStatus('chairperson', workflow.chairperson_approved)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Section */}
      {canTakeAction() && (
        <Card>
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
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
