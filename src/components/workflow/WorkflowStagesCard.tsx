
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkflowStage, LoanApplication } from './types';

interface WorkflowStagesCardProps {
  workflow: WorkflowStage;
  application: LoanApplication;
}

const WorkflowStagesCard: React.FC<WorkflowStagesCardProps> = ({ workflow, application }) => {
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

  const getNotesAsString = (notes: string | boolean | null | undefined): string => {
    if (!notes) return 'No notes';
    if (typeof notes === 'boolean') return 'No notes';
    return notes;
  };

  return (
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

          {/* Chairperson */}
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

          {/* CEO */}
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
  );
};

export default WorkflowStagesCard;
