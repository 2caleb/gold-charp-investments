
import React from 'react';
import GoldCharpLogo from '@/components/logo/GoldCharpLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NoActionRequiredProps {
  userRole?: string;
  message?: string;
  detail?: string;
}

const NoActionRequired: React.FC<NoActionRequiredProps> = ({ 
  userRole, 
  message = 'There are no items requiring your attention at this time.',
  detail
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>No Action Required</CardTitle>
        <CardDescription>
          {userRole ? `Role: ${userRole}` : 'Welcome'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-8">
        <GoldCharpLogo size="medium" className="mb-8" />
        <p className="text-center text-gray-600 max-w-md mb-4">
          {message}
        </p>
        {detail && (
          <p className="text-center text-sm text-gray-500 max-w-md mb-4">
            {detail}
          </p>
        )}
        <p className="text-center text-sm text-gray-500">
          You can access all features of the application now.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoActionRequired;
