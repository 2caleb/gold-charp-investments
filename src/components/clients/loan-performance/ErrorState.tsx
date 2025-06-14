
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  clientName: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ clientName }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertCircle className="mr-2 h-5 w-5" />
          Error Loading Live Loan Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Unable to load loan performance data.</p>
        <p className="text-xs text-gray-500 mt-2">Search term: "{clientName}"</p>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
