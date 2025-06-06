
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  Amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  date: string;
  created_by: string;
}

interface EditableTransactionRowProps {
  transaction: Transaction;
  onUpdate: () => void;
  onDelete: () => void;
  canEdit: boolean;
}

const EditableTransactionRow: React.FC<EditableTransactionRowProps> = ({
  transaction,
  onUpdate,
  onDelete,
  canEdit
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    description: transaction.description || '',
    amount: transaction.amount || '',
    Amount: transaction.Amount || 0,
    transaction_type: transaction.transaction_type || 'expense',
    category: transaction.category || '',
    date: transaction.date || new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      description: transaction.description || '',
      amount: transaction.amount || '',
      Amount: transaction.Amount || 0,
      transaction_type: transaction.transaction_type || 'expense',
      category: transaction.category || '',
      date: transaction.date || new Date().toISOString().split('T')[0]
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          description: editedData.description,
          amount: editedData.amount,
          Amount: editedData.Amount,
          transaction_type: editedData.transaction_type,
          category: editedData.category,
          date: editedData.date
        })
        .eq('id', transaction.id);

      if (error) throw error;

      toast({
        title: "Transaction Updated",
        description: "Changes saved successfully",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transaction.id);

      if (error) throw error;

      toast({
        title: "Transaction Deleted",
        description: "Transaction removed successfully",
      });

      onDelete();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  if (isEditing) {
    return (
      <TableRow className="bg-blue-50">
        <TableCell>
          <Input
            value={editedData.description}
            onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
            placeholder="Description"
            className="min-w-[200px]"
          />
        </TableCell>
        <TableCell>
          <Select
            value={editedData.transaction_type}
            onValueChange={(value: 'income' | 'expense') => 
              setEditedData({ ...editedData, transaction_type: value })
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
        </TableCell>
        <TableCell>
          <Input
            value={editedData.category}
            onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
            placeholder="Category"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={editedData.Amount}
            onChange={(e) => setEditedData({ ...editedData, Amount: parseFloat(e.target.value) || 0 })}
            placeholder="Amount"
            className="min-w-[120px]"
          />
        </TableCell>
        <TableCell>
          <Input
            type="date"
            value={editedData.date}
            onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{transaction.description}</TableCell>
      <TableCell>
        <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'secondary'}>
          {transaction.transaction_type}
        </Badge>
      </TableCell>
      <TableCell className="capitalize">{transaction.category}</TableCell>
      <TableCell className={`font-semibold ${
        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.transaction_type === 'income' ? '+' : '-'}
        {formatCurrency(transaction.Amount || transaction.amount)}
      </TableCell>
      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
      <TableCell>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EditableTransactionRow;
