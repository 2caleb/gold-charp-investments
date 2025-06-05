
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { LoanApplication } from './types';

interface ApplicationDetailsCardProps {
  application: LoanApplication;
}

const ApplicationDetailsCard: React.FC<ApplicationDetailsCardProps> = ({ application }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Application Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Client Name:</span>
            <p className="text-lg">{application.client_name}</p>
          </div>
          <div>
            <span className="font-medium">Loan Amount:</span>
            <p className="text-lg text-green-600 font-semibold">{application.loan_amount} UGX</p>
          </div>
          <div>
            <span className="font-medium">Loan Type:</span>
            <p className="text-lg capitalize">{application.loan_type.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="font-medium">Purpose:</span>
            <p className="text-lg">{application.purpose_of_loan}</p>
          </div>
          <div>
            <span className="font-medium">Monthly Income:</span>
            <p className="text-lg">{application.monthly_income.toLocaleString()} UGX</p>
          </div>
          <div>
            <span className="font-medium">Employment:</span>
            <p className="text-lg capitalize">{application.employment_status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationDetailsCard;
