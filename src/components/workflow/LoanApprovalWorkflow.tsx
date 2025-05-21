
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertTriangle, FileText, UserCheck, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import NoActionRequired from './NoActionRequired';
import { InstallmentCalculator } from '@/components/loans/InstallmentCalculator';

// Define workflow stages
export type WorkflowStage = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairman' | 'completed';

export interface WorkflowLoanData {
  id: string;
  client_name: string;
  loan_type: string;
  loan_amount: number;
  created_at: string;
  created_by: string;
  created_by_name?: string; // Name of the submitter
  status: 'submitted' | 'in_review' | 'approved' | 'rejected';
  current_stage: WorkflowStage;
  current_approver: string;
  current_approver_name?: string; // Name of the current approver
  last_action_by?: string;
  last_action_by_name?: string; // Name of the last person who took action
  last_action_date?: string;
  next_approver?: string;
  next_approver_name?: string; // Name of the next approver
  note?: string;
  approval_notes?: string;
  rejection_reason?: string;
  purpose_of_loan?: string;
  review_notes?: string;
  manager_approved?: boolean;
  manager_approved_at?: string;
  manager_approved_by?: string;
  manager_approved_by_name?: string;
  director_approved?: boolean;
  director_approved_at?: string;
  director_approved_by?: string;
  director_approved_by_name?: string;
  ceo_approved?: boolean;
  ceo_approved_at?: string;
  ceo_approved_by?: string;
  ceo_approved_by_name?: string;
  chairman_approved?: boolean;
  chairman_approved_at?: string;
  chairman_approved_by?: string;
  chairman_approved_by_name?: string;
}

interface LoanApprovalWorkflowProps {
  loanData: WorkflowLoanData;
  onWorkflowUpdate?: () => void;
  readOnly?: boolean;
}

const LoanApprovalWorkflow: React.FC<LoanApprovalWorkflowProps> = ({ loanData, onWorkflowUpdate, readOnly = false }) => {
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('details');
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (loanData?.approval_notes) {
      setNotes(loanData.approval_notes);
    }
  }, [loanData]);

  // Check if the current user is the approver for this stage
  const isCurrentApprover = () => {
    if (!user || !loanData) return false;
    
    // If the loan is already completed, return false
    if (loanData.current_stage === 'completed') return false;
    
    // Check if the current user is the assigned approver
    if (loanData.current_approver === user.id) return true;
    
    // Also check based on role and current stage
    const roleToStageMap: Record<string, WorkflowStage> = {
      'field_officer': 'field_officer',
      'manager': 'manager',
      'director': 'director',
      'ceo': 'ceo',
      'chairman': 'chairman'
    };
    
    // If the user role matches the expected role for the current stage
    return roleToStageMap[userRole.toLowerCase()] === loanData.current_stage;
  };
  
  const getNextStage = (currentStage: WorkflowStage): WorkflowStage => {
    const stageOrder: WorkflowStage[] = ['field_officer', 'manager', 'director', 'ceo', 'chairman', 'completed'];
    const currentIndex = stageOrder.indexOf(currentStage);
    
    if (currentIndex < 0 || currentIndex >= stageOrder.length - 1) {
      return 'completed';
    }
    
    return stageOrder[currentIndex + 1];
  };
  
  const getNextApprover = async (nextStage: WorkflowStage): Promise<string> => {
    if (nextStage === 'completed') return '';
    
    // Get the user with the appropriate role
    const roleMap: Record<WorkflowStage, string> = {
      'field_officer': 'field_officer',
      'manager': 'manager', 
      'director': 'director',
      'ceo': 'ceo',
      'chairman': 'chairman',
      'completed': ''
    };
    
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('role', roleMap[nextStage])
      .limit(1)
      .single();
      
    return data ? data.id : '';
  };
  
  const handleApprove = async () => {
    if (!user || !loanData) return;
    
    setIsSubmitting(true);
    
    try {
      const nextStage = getNextStage(loanData.current_stage);
      const nextApprover = await getNextApprover(nextStage);
      
      const updateData: any = {
        approval_notes: notes,
        last_action_by: user.id,
        last_action_date: new Date().toISOString(),
      };
      
      // Add stage-specific data
      if (loanData.current_stage === 'field_officer') {
        updateData.manager_approved = true;
        updateData.manager_approved_at = new Date().toISOString();
        updateData.manager_approved_by = user.id;
      } else if (loanData.current_stage === 'manager') {
        updateData.director_approved = true;
        updateData.director_approved_at = new Date().toISOString();
        updateData.director_approved_by = user.id;
      } else if (loanData.current_stage === 'director') {
        updateData.ceo_approved = true;
        updateData.ceo_approved_at = new Date().toISOString();
        updateData.ceo_approved_by = user.id;
      } else if (loanData.current_stage === 'ceo') {
        updateData.chairman_approved = true;
        updateData.chairman_approved_at = new Date().toISOString();
        updateData.chairman_approved_by = user.id;
      }
      
      // If final approval
      if (nextStage === 'completed') {
        updateData.status = 'approved';
      }
      
      // Update current stage and approver
      updateData.current_stage = nextStage;
      updateData.current_approver = nextApprover;
      updateData.status = nextStage === 'completed' ? 'approved' : 'in_review';
      
      const { error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', loanData.id);
        
      if (error) throw error;
      
      // Create notification for the next approver if there is one
      if (nextApprover) {
        await supabase.from('notifications').insert({
          user_id: nextApprover,
          message: `Loan application ${loanData.id} requires your review`,
          related_to: 'loan_application',
          entity_id: loanData.id
        });
      }
      
      // Create notification for the loan submitter about progress
      await supabase.from('notifications').insert({
        user_id: loanData.created_by,
        message: `Your loan application #${loanData.id.slice(0, 8)} was approved by ${userRole}`,
        related_to: 'loan_application',
        entity_id: loanData.id
      });
      
      toast({
        title: "Approved",
        description: nextStage === 'completed' 
          ? "Loan has been fully approved!"
          : `Loan moved to ${nextStage.replace('_', ' ')} for next approval`,
      });
      
      if (onWorkflowUpdate) onWorkflowUpdate();
      
    } catch (error: any) {
      console.error("Error approving loan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve loan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!user || !loanData) return;
    
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide rejection reason in the notes",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updateData = {
        status: 'rejected',
        rejection_reason: notes,
        approval_notes: notes,
        last_action_by: user.id,
        last_action_date: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', loanData.id);
        
      if (error) throw error;
      
      // Create notification for the loan submitter about rejection
      await supabase.from('notifications').insert({
        user_id: loanData.created_by,
        message: `Your loan application #${loanData.id.slice(0, 8)} was rejected`,
        related_to: 'loan_application',
        entity_id: loanData.id
      });
      
      toast({
        title: "Rejected",
        description: "Loan has been rejected",
      });
      
      if (onWorkflowUpdate) onWorkflowUpdate();
      
    } catch (error: any) {
      console.error("Error rejecting loan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject loan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (loanData.status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">Submitted</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">In Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getApprovalStatus = (stage: WorkflowStage) => {
    if (loanData.status === 'rejected') {
      return { status: 'rejected', date: loanData.last_action_date, by: loanData.last_action_by_name };
    }
    
    const stageToDataMap: Record<WorkflowStage, { 
      approved: boolean | undefined, 
      date: string | undefined, 
      by: string | undefined 
    }> = {
      'field_officer': {
        approved: true, // Submission is considered field officer approval
        date: loanData.created_at, 
        by: loanData.created_by_name
      },
      'manager': {
        approved: loanData.manager_approved,
        date: loanData.manager_approved_at,
        by: loanData.manager_approved_by_name
      },
      'director': {
        approved: loanData.director_approved,
        date: loanData.director_approved_at,
        by: loanData.director_approved_by_name
      },
      'ceo': {
        approved: loanData.ceo_approved,
        date: loanData.ceo_approved_at,
        by: loanData.ceo_approved_by_name
      },
      'chairman': {
        approved: loanData.chairman_approved,
        date: loanData.chairman_approved_at,
        by: loanData.chairman_approved_by_name
      },
      'completed': {
        approved: loanData.status === 'approved',
        date: loanData.last_action_date,
        by: loanData.last_action_by_name
      }
    };
    
    return stageToDataMap[stage];
  };
  
  const renderStageStatus = (stage: WorkflowStage, label: string) => {
    const status = getApprovalStatus(stage);
    const current = loanData.current_stage === stage;
    
    return (
      <div className={`flex items-center py-2 px-4 rounded-md ${current ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          {status.approved === true && (
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          )}
          
          {status.approved === false && (
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          )}
          
          {status.approved === undefined && (
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              {current ? (
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status.approved === true && `Approved ${status.date ? `by ${status.by || 'staff'} on ${formatDate(status.date)}` : ''}`}
            {status.approved === false && `Rejected ${status.date ? `by ${status.by || 'staff'} on ${formatDate(status.date)}` : ''}`}
            {status.approved === undefined && (current ? "Awaiting review" : "Pending")}
          </p>
        </div>
      </div>
    );
  };
  
  const renderApprovalWorkflow = () => {
    return (
      <div className="space-y-1">
        {renderStageStatus('field_officer', 'Field Officer')}
        {renderStageStatus('manager', 'Manager')}
        {renderStageStatus('director', 'Director')}
        {renderStageStatus('ceo', 'CEO')}
        {renderStageStatus('chairman', 'Chairman')}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Loan Approval Workflow
            </CardTitle>
            <CardDescription>
              Track loan application approval process
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Loan Details</TabsTrigger>
            <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
            <TabsTrigger value="calculator">Payment Calculator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Client</Label>
                <p className="font-medium">{loanData.client_name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Loan Amount</Label>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(loanData.loan_amount)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Loan Type</Label>
                <p className="font-medium">{loanData.loan_type}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Loan Purpose</Label>
                <p className="font-medium">{loanData.purpose_of_loan || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Submission Date</Label>
                <p className="font-medium">{formatDate(loanData.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Submitted By</Label>
                <p className="font-medium">{loanData.created_by_name || 'Unknown'}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Approval Notes</Label>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md min-h-24 whitespace-pre-wrap">
                {loanData.approval_notes || 'No notes provided.'}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="workflow" className="space-y-4">
            {renderApprovalWorkflow()}
            
            {isCurrentApprover() && !readOnly && (
              <div className="mt-6 space-y-4">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Reviewer Notes
                </Label>
                <Textarea 
                  id="notes"
                  placeholder="Add your notes or comments here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-24"
                />
                <div className="flex items-center gap-4 mt-4">
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
                
                {loanData.status === 'rejected' && (
                  <div className="flex items-center p-4 mt-4 bg-red-50 dark:bg-red-900/20 rounded-md text-red-800 dark:text-red-200">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">This loan application has been rejected</p>
                      <p className="text-sm">Reason: {loanData.rejection_reason || 'No reason provided'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isCurrentApprover() && !readOnly && (
              <NoActionRequired 
                message="You are not currently assigned as the approver for this loan application."
                detail="The loan is awaiting review by another staff member."
              />
            )}
            
            {readOnly && (
              <div className="flex items-center p-4 mt-4 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-800 dark:text-gray-200">
                <UserCheck className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">This is a read-only view</p>
                  <p className="text-sm">You cannot modify the approval status.</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="calculator">
            <InstallmentCalculator 
              loanAmount={loanData.loan_amount} 
              duration={12} 
              termUnit="months" 
              interestRate={12}
              className=""
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 text-sm text-gray-500">
        <div>
          Loan ID: {loanData.id && loanData.id.slice(0, 8)}
        </div>
        <div>
          Last updated: {formatDate(loanData.last_action_date || loanData.created_at)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoanApprovalWorkflow;
