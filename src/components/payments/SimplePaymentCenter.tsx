
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import BasicLoanBookTable from './BasicLoanBookTable';
import { useBasicLoanData } from '@/hooks/use-basic-loan-data';

const SimplePaymentCenter = () => {
  const { data: loanData = [], isLoading } = useBasicLoanData();

  const handleExport = () => {
    console.log('Exporting loan data...');
    // Basic export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Center</h1>
          <p className="text-muted-foreground">
            Manage loan payments and view current loan book
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Payment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BasicLoanBookTable 
            loanData={loanData}
            isLoading={isLoading}
            onExport={handleExport}
            isExporting={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePaymentCenter;
