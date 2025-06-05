
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowActionCardProps {
  userRole: string | null;
  notes: string;
  setNotes: (notes: string) => void;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const WorkflowActionCard: React.FC<WorkflowActionCardProps> = ({
  userRole,
  notes,
  setNotes,
  isProcessing,
  onApprove,
  onReject
}) => {
  return (
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
            onClick={onApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            onClick={onReject}
            disabled={isProcessing}
            variant="destructive"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowActionCard;
