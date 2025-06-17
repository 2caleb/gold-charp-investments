
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, Filter, Download, Search, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyUtils';

interface ExpenseData {
  id: string;
  Account: string;
  particulars: string;
  amount: number;
  expense_date: string;
  account_name?: string;
  Final_amount: number;
  category: string;
  status: string;
}

interface ExpensesTableProps {
  filteredExpenses: ExpenseData[];
  expenseSearchTerm: string;
  setExpenseSearchTerm: (term: string) => void;
  onExport: () => void;
  isExporting: boolean;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  filteredExpenses,
  expenseSearchTerm,
  setExpenseSearchTerm,
  onExport,
  isExporting
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <TrendingDown className="mr-2 h-5 w-5" />
            Live Expense Management ({filteredExpenses.length} records)
            <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">Real-time</Badge>
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExport}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search expenses..."
              value={expenseSearchTerm}
              onChange={(e) => setExpenseSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expense Date</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.Account}</TableCell>
                    <TableCell>{expense.particulars}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{expense.account_name || 'N/A'}</TableCell>
                    <TableCell className="text-blue-600">
                      {formatCurrency(expense.Final_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.status === 'approved' ? 'default' : 'secondary'}
                        className={expense.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {expense.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">
                        No expense records available
                      </p>
                    </div>
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

export default ExpensesTable;
