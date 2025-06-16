
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

export interface BasicLoanBookTableProps {
  loanData: any[];
  isLoading: boolean;
  onExport: () => void;
  isExporting: boolean;
}

const BasicLoanBookTable: React.FC<BasicLoanBookTableProps> = ({
  loanData,
  isLoading,
  onExport,
  isExporting
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading loan data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Loan Book Management</CardTitle>
          <Button onClick={onExport} disabled={isExporting} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanData.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.client_name}</TableCell>
                  <TableCell>{formatCurrency(loan.amount_returnable)}</TableCell>
                  <TableCell>{formatCurrency(loan.remaining_balance)}</TableCell>
                  <TableCell>
                    <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(loan.loan_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {loanData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No loan data available</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicLoanBookTable;
