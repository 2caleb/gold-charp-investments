
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  description: string;
  amount: number; // Updated to match the new database structure
  transaction_type: 'income' | 'expense';
  category: string;
  date: string;
  created_by: string;
  status?: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  reference_number?: string;
}

interface ReadOnlyTransactionRowProps {
  transaction: Transaction;
}

const ReadOnlyTransactionRow: React.FC<ReadOnlyTransactionRowProps> = ({ transaction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

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
        {formatCurrency(transaction.amount)}
      </TableCell>
      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
    </TableRow>
  );
};

export default ReadOnlyTransactionRow;
