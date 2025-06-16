
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, RefreshCw, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLiveLoanData } from '@/hooks/use-live-loan-data';
import { useMLInsights } from '@/hooks/use-ml-insights';
import { useLiveExpensesData } from '@/hooks/use-live-expenses-data';
import { formatCurrency } from '@/utils/loanUtils';

const EnhancedLoanBookTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: loans = [], isLoading: loansLoading, refetch: refetchLoans } = useLiveLoanData();
  const { data: expenses = [] } = useLiveExpensesData();
  const mlInsights = useMLInsights(loans, expenses);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const loanRisk = mlInsights.riskPredictions.find(r => r.loanId === loan.id);
    const matchesRisk = riskFilter === 'all' || loanRisk?.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const handleRefresh = () => {
    refetchLoans();
  };

  const handleExport = () => {
    const csvContent = [
      ['Client Name', 'Loan Amount', 'Total Paid', 'Remaining Balance', 'Risk Level', 'Status'],
      ...filteredLoans.map(loan => {
        const totalPaid = (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + 
                         (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0);
        const riskInfo = mlInsights.riskPredictions.find(r => r.loanId === loan.id);
        return [
          loan.client_name,
          loan.amount_returnable.toString(),
          totalPaid.toString(),
          (loan.remaining_balance || 0).toString(),
          riskInfo?.riskLevel || 'unknown',
          loan.status || 'active'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-book-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loansLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading loan data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Enhanced Loan Portfolio ({filteredLoans.length} loans)
          </span>
          <div className="flex items-center space-x-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="critical">Critical Risk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="defaulted">Defaulted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loan Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => {
                const totalPaid = (loan.amount_paid_1 || 0) + (loan.amount_paid_2 || 0) + 
                                 (loan.amount_paid_3 || 0) + (loan.amount_paid_4 || 0);
                const progress = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
                const riskInfo = mlInsights.riskPredictions.find(r => r.loanId === loan.id);

                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.client_name}</TableCell>
                    <TableCell>{formatCurrency(loan.amount_returnable)}</TableCell>
                    <TableCell>{formatCurrency(totalPaid)}</TableCell>
                    <TableCell>{formatCurrency(loan.remaining_balance || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{progress.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(riskInfo?.riskLevel || 'unknown')}>
                        {riskInfo?.riskLevel || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                        {loan.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {riskInfo?.riskLevel === 'critical' && (
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No loans found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedLoanBookTable;
