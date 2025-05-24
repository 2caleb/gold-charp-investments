
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnimatedWorkflowStatus from './AnimatedWorkflowStatus';
import { CheckCircle, XCircle, User, Phone, MapPin, Briefcase, DollarSign, Target, Sparkles } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {/* Animated Workflow Status */}
      <AnimatedWorkflowStatus
        currentStage={currentStage}
        workflowData={loanData.loan_application_workflow}
        status={loanData.status}
        onAnimationComplete={() => setShowAnimation(false)}
      />

      {/* Premium Loan Details Card */}
      <Card className="premium-card border-0 shadow-2xl hover-lift">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"></div>
          <CardTitle className="text-3xl font-bold flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            Application Details
          </CardTitle>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        </CardHeader>
        <CardContent className="p-10 bg-gradient-to-br from-white/95 to-purple-50/30 dark:from-gray-800/95 dark:to-purple-900/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3 group">
              <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">Client Name</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 ml-14">{loanData.client_name}</p>
            </div>
            
            <div className="space-y-3 group">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">ID Number</span>
              </div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 ml-14">{loanData.id_number}</p>
            </div>
            
            <div className="space-y-3 group">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">Phone Number</span>
              </div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 ml-14">{phoneNumber}</p>
            </div>
            
            <div className="space-y-3 group">
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">Loan Amount</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 ml-14">
                UGX {Number(loanData.loan_amount).toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-3 group">
              <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">Purpose</span>
              </div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 ml-14">
                {loanData.purpose_of_loan || loanData.purpose}
              </p>
            </div>
            
            <div className="space-y-3 group">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">Employment Status</span>
              </div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 ml-14">{loanData.employment_status}</p>
            </div>
            
            <div className="space-y-3 md:col-span-2 lg:col-span-3 group">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">Address</span>
              </div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 ml-14">{loanData.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Panel */}
      {canModify && !['approved', 'rejected', 'rejected_final'].includes(loanData.status) && (
        <Card className="premium-card border-0 shadow-2xl hover-lift">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20"></div>
            <CardTitle className="text-2xl font-bold relative z-10">
              {currentStage === 'field_officer' && '📝 Data Entry Verification'}
              {currentStage === 'manager' && '👔 Manager Review'}
              {currentStage === 'director' && '🎯 Risk Assessment'}
              {currentStage === 'chairperson' && '🏆 Chairperson Approval'}
              {currentStage === 'ceo' && '👑 CEO Final Decision'}
            </CardTitle>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          </CardHeader>
          <CardContent className="p-10 bg-gradient-to-br from-white/95 to-indigo-50/30 dark:from-gray-800/95 dark:to-indigo-900/30">
            <div className="space-y-8">
              <div>
                <label htmlFor="notes" className="block text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
                  ✍️ Notes/Comments
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your professional notes or comments here..."
                  className="h-40 premium-input text-lg resize-none"
                />
              </div>

              <div className="flex gap-6 justify-end pt-6">
                <Button
                  variant="destructive"
                  onClick={() => handleDecision('reject')}
                  disabled={isSubmitting}
                  className="px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:-translate-y-1 rounded-xl"
                >
                  <XCircle className="mr-3 h-6 w-6" />
                  {currentStage === 'ceo' ? '❌ Final Rejection' : '❌ Reject'}
                </Button>
                <Button
                  onClick={() => handleDecision('approve')}
                  disabled={isSubmitting}
                  className="premium-button px-8 py-4 text-lg font-bold"
                >
                  <CheckCircle className="mr-3 h-6 w-6" />
                  {currentStage === 'ceo' ? '✅ Final Approval' : '✅ Approve & Forward'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read-only message for unauthorized users */}
      {!canModify && (
        <Card className="premium-card border-0 shadow-2xl">
          <CardContent className="p-10 text-center bg-gradient-to-br from-amber-50/95 to-orange-50/95 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="text-amber-800 dark:text-amber-200">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-4">🔒 Read-Only Mode</p>
              <p className="text-lg opacity-90">
                This application is currently at the <span className="font-bold">{currentStage.replace('_', ' ')}</span> stage. 
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
