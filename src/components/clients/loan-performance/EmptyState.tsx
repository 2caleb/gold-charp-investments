
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';

interface EmptyStateProps {
  clientName: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ clientName }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Enhanced Live Loan Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active loans found for this client</p>
          <p className="text-xs text-gray-400 mt-2">Searched for: "{clientName}"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
