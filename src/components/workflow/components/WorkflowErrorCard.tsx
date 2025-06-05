
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface WorkflowErrorCardProps {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const WorkflowErrorCard: React.FC<WorkflowErrorCardProps> = ({ 
  error, 
  onRetry, 
  retryLabel = 'Retry' 
}) => {
  return (
    <Card className="border-red-200">
      <CardContent className="p-6">
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
          >
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowErrorCard;
