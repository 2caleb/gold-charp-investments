
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportLoanBookToExcel, exportExpensesToExcel } from '@/utils/excelExportUtils';

export const usePaymentHandlers = () => {
  const [isExportingLoanBook, setIsExportingLoanBook] = useState(false);
  const [isExportingExpenses, setIsExportingExpenses] = useState(false);
  const { toast } = useToast();

  const handleExportLoanBook = async (loanBookData: any[]) => {
    setIsExportingLoanBook(true);
    try {
      await exportLoanBookToExcel(loanBookData);
      toast({
        title: 'Export Successful',
        description: 'Loan book data has been exported to Excel.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export loan book data.',
        variant: 'destructive',
      });
    } finally {
      setIsExportingLoanBook(false);
    }
  };

  const handleExportExpenses = async (expensesData: any[]) => {
    setIsExportingExpenses(true);
    try {
      await exportExpensesToExcel(expensesData);
      toast({
        title: 'Export Successful',
        description: 'Expenses data has been exported to Excel.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export expenses data.',
        variant: 'destructive',
      });
    } finally {
      setIsExportingExpenses(false);
    }
  };

  return {
    handleExportLoanBook,
    handleExportExpenses,
    isExportingLoanBook,
    isExportingExpenses,
  };
};
