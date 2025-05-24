
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnimatedWorkflowStatus from './AnimatedWorkflowStatus';
import { CheckCircle, XCircle, User, Phone, MapPin, Briefcase, DollarSign, Target } from 'lucide-react';
import { WorkflowLoanData } from '@/types/workflow';

interface EnhancedLoanApprovalWorkflowProps {
  loanData: WorkflowLoanData;
  onWorkflowUpdate?: () => void;
}

const EnhancedLoanApprovalWorkflow: React.FC<EnhancedLoanApprovalWorkflowProps> = ({ 
  loanData, 
  onWorkflowUpdate 
}) => {
  const { userProfile } = useUser();
  const { userRole, canModifyLoanApplication } = useRolePermissions();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const currentStage = loanData.workflow_stage || 'field_officer';
  const canModify = canModifyLoanApplication(currentStage);

  // Get the phone number from either field
  const phoneNumber = loanData.phone || loanData.phone_number || 'Not provided';

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-workflow-system', {
        body: {
          action: 'process_workflow',
          loan_id: loanData.id,
          approver_id: userProfile.id,
          decision,
          notes
        }
      });

      if (error) throw error;

      toast({
        title: decision === 'approve' ? 'Application Approved' : 'Application Rejected',
        description: `You have successfully ${decision}d this loan application.`,
      });

      // Show animation for final decisions
      if (data.is_final) {
        setShowAnimation(true);
      }

      if (onWorkflowUpdate) {
        onWorkflowUpdate();
      }
    } catch (error: any) {
      console.error('Error processing decision:', error);
      toast({
        title: 'Action Failed',
        description: error.message || 'There was an error processing your request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Animated Workflow Status */}
      <AnimatedWorkflowStatus
        currentStage={currentStage}
        workflowData={loanData.loan_application_workflow}
        status={loanData.status}
        onAnimationComplete={() => setShowAnimation(false)}
      />

      {/* Premium Loan Details Card */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Client Name</span>
              </div>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{loanData.client_name}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">ID Number</span>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{loanData.id_number}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Phone Number</span>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{phoneNumber}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Loan Amount</span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                UGX {Number(loanData.loan_amount).toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Purpose</span>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {loanData.purpose_of_loan || loanData.purpose}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm font-medium">Employment Status</span>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{loanData.employment_status}</p>
            </div>
            
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{loanData.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Panel */}
      {canModify && !['approved', 'rejected', 'rejected_final'].includes(loanData.status) && (
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-bold">
              {currentStage === 'field_officer' && 'Data Entry Verification'}
              {currentStage === 'manager' && 'Manager Review'}
              {currentStage === 'director' && 'Risk Assessment'}
              {currentStage === 'chairperson' && 'Chairperson Approval'}
              {currentStage === 'ceo' && 'CEO Final Decision'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  Notes/Comments
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes or comments here..."
                  className="h-32 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDecision('reject')}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  {currentStage === 'ceo' ? 'Final Rejection' : 'Reject'}
                </Button>
                <Button
                  onClick={() => handleDecision('approve')}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {currentStage === 'ceo' ? 'Final Approval' : 'Approve & Forward'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read-only message for unauthorized users */}
      {!canModify && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-amber-800 dark:text-amber-200">
              <div className="mb-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              <p className="text-xl font-semibold mb-2">Read-Only Mode</p>
              <p className="text-base">
                This application is currently at the {currentStage.replace('_', ' ')} stage. 
                You can view the details but cannot make decisions at this stage.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLoanApprovalWorkflow;
