
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface NoPermissionCardProps {
  userRole: string | null;
  currentStage: string;
  getStageDisplayName: (stage: string) => string;
}

const NoPermissionCard: React.FC<NoPermissionCardProps> = ({
  userRole,
  currentStage,
  getStageDisplayName
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-gray-600">
          <p>You don't have permission to take action on this application at its current stage.</p>
          <p className="mt-2">Current stage: <span className="font-semibold">{getStageDisplayName(currentStage)}</span></p>
          <p>Your role: <span className="font-semibold capitalize">{userRole}</span></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoPermissionCard;
