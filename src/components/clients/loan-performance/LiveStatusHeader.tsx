
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Eye, EyeOff } from 'lucide-react';

interface LiveStatusHeaderProps {
  recentlyUpdated: boolean;
  completedCount: number;
  showCompleted: boolean;
  onToggleCompleted: () => void;
}

const LiveStatusHeader: React.FC<LiveStatusHeaderProps> = ({
  recentlyUpdated,
  completedCount,
  showCompleted,
  onToggleCompleted
}) => {
  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Zap className="mr-2 h-5 w-5 text-green-600" />
            Enhanced Live Loan Performance
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">
              Real-time Updates
            </Badge>
            {recentlyUpdated && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-700 animate-pulse">
                Recently Updated
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleCompleted}
              className="flex items-center"
            >
              {showCompleted ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide Completed ({completedCount})
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show Completed ({completedCount})
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default LiveStatusHeader;
