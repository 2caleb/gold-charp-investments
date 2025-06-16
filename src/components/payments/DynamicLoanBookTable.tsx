
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

export interface DynamicLoanBookTableProps {
  loanData: any[];
  isLoading: boolean;
  onExport: () => void;
  isExporting: boolean;
}

const DynamicLoanBookTable: React.FC<DynamicLoanBookTableProps> = ({
  loanData,
  isLoading,
  onExport,
  isExporting
}) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return loanData;
    
    return [...loanData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [loanData, sortField, sortDirection]);

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Loan Book</CardTitle>
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
          <CardTitle className="flex items-center">
            Live Loan Book Management
          </CardTitle>
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
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('client_name')}
                >
                  Client Name
                  {sortField === 'client_name' && (
                    sortDirection === 'asc' ? <TrendingUp className="h-4 w-4 inline ml-1" /> : <TrendingDown className="h-4 w-4 inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('amount_returnable')}
                >
                  Loan Amount
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('remaining_balance')}
                >
                  Remaining Balance
                </TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((loan) => {
                const totalPaid = (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + 
                                 (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0);
                const paymentProgress = loan.amount_returnable > 0 ? 
                  (totalPaid / loan.amount_returnable) * 100 : 0;

                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.client_name}</TableCell>
                    <TableCell>{formatCurrency(loan.amount_returnable)}</TableCell>
                    <TableCell>{formatCurrency(loan.remaining_balance)}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeColor(loan.risk_level)}>
                        {loan.risk_level || 'Low'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {paymentProgress.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
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

export default DynamicLoanBookTable;
