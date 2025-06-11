
import * as XLSX from 'xlsx';

interface LoanBookData {
  id: string;
  client_name: string;
  amount_returnable: number;
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  remaining_balance: number;
  payment_mode: string;
  loan_date: string;
  status: string;
}

interface ExpenseData {
  id: string;
  Account: string;
  particulars: string;
  amount: number;
  expense_date: string;
  account_name: string;
  Final_amount: number;
  category: string;
  status: string;
}

interface TransactionData {
  id: string;
  amount: number;
  description: string;
  category: string;
  transaction_type: string;
  date: string;
  status: string;
}

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (!amount) return '0';
  
  let numAmount: number;
  if (typeof amount === 'string') {
    numAmount = parseFloat(amount.replace(/,/g, ''));
  } else {
    numAmount = amount;
  }
  
  if (isNaN(numAmount)) return '0';
  return numAmount.toFixed(2);
};

export const exportLoanBookToExcel = (data: LoanBookData[], dateRange?: { from: Date; to: Date }) => {
  try {
    let filteredData = data;
    
    // Apply date filtering if provided
    if (dateRange) {
      filteredData = data.filter(loan => {
        const loanDate = new Date(loan.loan_date);
        return loanDate >= dateRange.from && loanDate <= dateRange.to;
      });
    }

    // Transform data for Excel
    const excelData = filteredData.map(loan => ({
      'Client Name': loan.client_name || '',
      'Amount Returnable': formatCurrency(loan.amount_returnable),
      'Amount Paid 1': formatCurrency(loan.amount_paid_1),
      'Amount Paid 2': formatCurrency(loan.amount_paid_2),
      'Amount Paid 3': formatCurrency(loan.amount_paid_3),
      'Remaining Balance': formatCurrency(loan.remaining_balance),
      'Payment Mode': loan.payment_mode || '',
      'Loan Date': new Date(loan.loan_date).toLocaleDateString(),
      'Status': loan.status || ''
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Add some styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Loan Book');

    // Generate filename with date range
    const dateStr = dateRange 
      ? `${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
      : new Date().toISOString().split('T')[0];
    
    const filename = `loan-book-${dateStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting loan book to Excel:', error);
    throw new Error('Failed to export loan book to Excel');
  }
};

export const exportExpensesToExcel = (data: ExpenseData[], dateRange?: { from: Date; to: Date }) => {
  try {
    let filteredData = data;
    
    // Apply date filtering if provided
    if (dateRange) {
      filteredData = data.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      });
    }

    // Transform data for Excel
    const excelData = filteredData.map(expense => ({
      'Account': expense.Account || '',
      'Particulars': expense.particulars || '',
      'Amount': formatCurrency(expense.amount),
      'Expense Date': new Date(expense.expense_date).toLocaleDateString(),
      'Account Name': expense.account_name || '',
      'Final Amount': formatCurrency(expense.Final_amount),
      'Category': expense.category || '',
      'Status': expense.status || ''
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Add some styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    // Generate filename with date range
    const dateStr = dateRange 
      ? `${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
      : new Date().toISOString().split('T')[0];
    
    const filename = `expenses-${dateStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting expenses to Excel:', error);
    throw new Error('Failed to export expenses to Excel');
  }
};

export const exportFinancialSummaryToExcel = (
  financialData: any,
  transactionData: TransactionData[],
  loanBookData: LoanBookData[],
  expensesData: ExpenseData[],
  dateRange?: { from: Date; to: Date }
) => {
  try {
    const wb = XLSX.utils.book_new();

    // Financial Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Income', formatCurrency(financialData?.total_income || 0)],
      ['Total Expenses', formatCurrency(financialData?.total_expenses || 0)],
      ['Net Income', formatCurrency(financialData?.net_income || 0)],
      ['Total Loan Portfolio', formatCurrency(financialData?.total_loan_portfolio || 0)],
      ['Total Repaid', formatCurrency(financialData?.total_repaid || 0)],
      ['Outstanding Balance', formatCurrency(financialData?.outstanding_balance || 0)],
      ['Active Loan Holders', financialData?.active_loan_holders || 0],
      ['Collection Rate', `${(financialData?.collection_rate || 0).toFixed(1)}%`]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Financial Summary');

    // Recent Transactions sheet
    if (transactionData && transactionData.length > 0) {
      let filteredTransactions = transactionData;
      if (dateRange) {
        filteredTransactions = transactionData.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
        });
      }

      const transactionExcelData = filteredTransactions.slice(0, 50).map(transaction => ({
        'Description': transaction.description,
        'Amount': formatCurrency(transaction.amount),
        'Category': transaction.category,
        'Type': transaction.transaction_type,
        'Date': new Date(transaction.date).toLocaleDateString(),
        'Status': transaction.status
      }));

      const transactionWs = XLSX.utils.json_to_sheet(transactionExcelData);
      XLSX.utils.book_append_sheet(wb, transactionWs, 'Recent Transactions');
    }

    // Generate filename
    const dateStr = dateRange 
      ? `${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
      : new Date().toISOString().split('T')[0];
    
    const filename = `financial-summary-${dateStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting financial summary to Excel:', error);
    throw new Error('Failed to export financial summary to Excel');
  }
};
