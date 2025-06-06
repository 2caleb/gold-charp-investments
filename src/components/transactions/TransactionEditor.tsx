
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import EditableTransactionRow from './EditableTransactionRow';
import { useFinancialTransactionsRealtime } from '@/hooks/use-financial-transactions-realtime';
import { useRolePermissions } from '@/hooks/use-role-permissions';

// Define the Transaction interface
interface Transaction {
  id: string;
  description: string;
  amount: string;
  Amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  loan_application_id?: string;
}

const TransactionEditor: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const { userRole, isDirector, isCEO, isChairperson, isManager } = useRolePermissions();
  
  // Set up real-time subscriptions
  useFinancialTransactionsRealtime();

  const canEdit = isDirector || isCEO || isChairperson || isManager || userRole === 'field_officer';

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    Amount: 0,
    transaction_type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch transactions with real-time updates
  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      console.log('Fetching financial transactions...');
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      return (data || []).map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'income' | 'expense',
        Amount: transaction.Amount || parseFloat(transaction.amount?.replace(/[^0-9.-]/g, '') || '0')
      })) as Transaction[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.transaction_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.Amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .insert({
          description: newTransaction.description,
          amount: newTransaction.Amount.toString(),
          Amount: newTransaction.Amount,
          transaction_type: newTransaction.transaction_type,
          category: newTransaction.category,
          date: newTransaction.date,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Transaction Added",
        description: "New transaction has been added successfully",
      });

      setNewTransaction({
        description: '',
        amount: '',
        Amount: 0,
        transaction_type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + (t.Amount || 0), 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + (t.Amount || 0), 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            Financial Transactions Manager
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
              {filteredTransactions.length} records
            </Badge>
          </span>
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Net Income</div>
              <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && canEdit && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Input
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
                <Select
                  value={newTransaction.transaction_type}
                  onValueChange={(value: 'income' | 'expense') => 
                    setNewTransaction({ ...newTransaction, transaction_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.Amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, Amount: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
                <Button onClick={handleAddTransaction} className="w-full">
                  Add Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(value: typeof filterType) => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expense">Expenses Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <td colSpan={6} className="text-center py-8">Loading transactions...</td>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="text-center py-8">No transactions found</td>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <EditableTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onUpdate={refetch}
                    onDelete={refetch}
                    canEdit={canEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionEditor;
