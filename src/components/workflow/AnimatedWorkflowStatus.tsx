
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, User, FileText, Shield, Crown, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WorkflowStage {
  id: string;
  name: string;
  displayName: string;
  icon: React.ReactNode;
  approved?: boolean | null;
  approverName?: string;
  notes?: string;
}

interface AnimatedWorkflowStatusProps {
  currentStage: string;
  workflowData: any;
  status: string;
  onAnimationComplete?: () => void;
}

const AnimatedWorkflowStatus: React.FC<AnimatedWorkflowStatusProps> = ({
  currentStage,
  workflowData,
  status,
  onAnimationComplete
}) => {
  const [activeStage, setActiveStage] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const stages: WorkflowStage[] = [
    {
      id: 'field_officer',
      name: 'field_officer',
      displayName: 'Field Officer',
      icon: <User className="h-5 w-5" />,
      approved: workflowData?.field_officer_approved,
      approverName: workflowData?.field_officer_name,
      notes: workflowData?.field_officer_notes
    },
    {
      id: 'manager',
      name: 'manager',
      displayName: 'Manager Review',
      icon: <FileText className="h-5 w-5" />,
      approved: workflowData?.manager_approved,
      approverName: workflowData?.manager_name,
      notes: workflowData?.manager_notes
    },
    {
      id: 'director',
      name: 'director',
      displayName: 'Director Risk Assessment',
      icon: <Shield className="h-5 w-5" />,
      approved: workflowData?.director_approved,
      approverName: workflowData?.director_name,
      notes: workflowData?.director_notes
    },
    {
      id: 'chairperson',
      name: 'chairperson',
      displayName: 'Chairperson Approval',
      icon: <Crown className="h-5 w-5" />,
      approved: workflowData?.chairperson_approved,
      approverName: workflowData?.chairperson_name,
      notes: workflowData?.chairperson_notes
    },
    {
      id: 'ceo',
      name: 'ceo',
      displayName: 'CEO Final Decision',
      icon: <Star className="h-5 w-5" />,
      approved: workflowData?.ceo_approved,
      approverName: workflowData?.ceo_name,
      notes: workflowData?.ceo_notes
    }
  ];

  useEffect(() => {
    const currentIndex = stages.findIndex(stage => stage.name === currentStage);
    setActiveStage(currentIndex);

    if (status === 'approved' || status === 'rejected' || status === 'rejected_final') {
      const timer = setTimeout(() => {
        setShowResult(true);
        onAnimationComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStage, status, onAnimationComplete]);

  const getStageStatus = (stage: WorkflowStage, index: number) => {
    if (stage.approved === true) return 'approved';
    if (stage.approved === false) return 'rejected';
    if (index === activeStage) return 'active';
    if (index < activeStage) return 'completed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Loan Approval Workflow</h3>
          
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const stageStatus = getStageStatus(stage, index);
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  {/* Stage Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(stageStatus)}`}
                    animate={stageStatus === 'active' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: stageStatus === 'active' ? Infinity : 0, duration: 2 }}
                  >
                    {stageStatus === 'approved' && <CheckCircle2 className="h-6 w-6" />}
                    {stageStatus === 'rejected' && <XCircle className="h-6 w-6" />}
                    {stageStatus === 'active' && <Clock className="h-6 w-6" />}
                    {(stageStatus === 'pending' || stageStatus === 'completed') && stage.icon}
                  </motion.div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{stage.displayName}</h4>
                      {stageStatus === 'active' && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          In Progress
                        </motion.span>
                      )}
                    </div>
                    
                    {stage.approverName && (
                      <p className="text-sm text-gray-600">
                        {stageStatus === 'approved' ? 'Approved' : stageStatus === 'rejected' ? 'Rejected' : 'Reviewed'} by: {stage.approverName}
                      </p>
                    )}
                    
                    {stage.notes && (
                      <p className="text-sm text-gray-500 mt-1">"{stage.notes}"</p>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < stages.length - 1 && (
                    <div className="absolute left-6 top-16 w-px h-8 bg-gray-200" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Final Result Animation */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-lg p-8 text-center max-w-md mx-4"
            >
              {status === 'approved' ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1 }}
                  >
                    <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-green-700 mb-2"
                  >
                    SUCCESSFUL
                  </motion.h2>
                  <p className="text-gray-600">Your loan application has been approved!</p>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1 }}
                  >
                    <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-red-700 mb-2"
                  >
                    FAILED
                  </motion.h2>
                  <p className="text-gray-600">Your loan application has been rejected.</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedWorkflowStatus;
