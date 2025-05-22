
import React from 'react';
import GoldCharpLogo from '@/components/logo/GoldCharpLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowLoanData } from '@/types/workflow';

interface NoActionRequiredProps {
  userRole?: string;
  message?: string;
  detail?: string;
  loanData?: WorkflowLoanData;
}

const NoActionRequired: React.FC<NoActionRequiredProps> = ({ 
  userRole, 
  message = 'There are no items requiring your attention at this time.',
  detail,
  loanData
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>No Action Required</CardTitle>
        <CardDescription>
          {userRole ? `Role: ${userRole}` : 'Welcome'}
          {loanData && ` - Viewing Application for ${loanData.client_name}`}
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

        {loanData && (
          <div className="mt-6 p-4 border rounded-lg w-full max-w-md">
            <h3 className="font-semibold mb-2">Loan Application Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Client:</span>
              <span className="font-medium">{loanData.client_name}</span>
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{loanData.loan_amount.toLocaleString()} UGX</span>
              <span className="text-gray-600">Purpose:</span>
              <span className="font-medium">{loanData.purpose}</span>
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{loanData.status}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoActionRequired;
