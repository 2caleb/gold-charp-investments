
/**
 * The official LoanBookLiveRecord interface matches ALL columns from the Supabase table "loan_book_live".
 * Updated to include all 26+ date-based payment columns and risk analytics fields.
 */
export interface LoanBookLiveRecord {
  id: string;
  client_name: string;
  amount_returnable: number;
  // All date-based payment columns from the actual database
  "19-05-2025": number;
  "22-05-2025": number;
  "26-05-2025": number;
  "27-05-2025": number;
  "28-05-2025": number;
  "30-05-2025": number;
  "31-05-2025": number;
  "02-06-2025": number;
  "04-06-2025": number;
  "05-06-2025": number;
  "07-06-2025": number;
  "10-06-2025": number;
  "11-06-2025": number;
  "12-06-2025": number;
  "13-06-2025": number;
  "14-06-2025": number;
  "16-06-2025": number;
  "17-06-2025": number;
  "18-06-2025": number;
  "19-06-2025": number;
  "20-06-2025": number;
  "23-06-2025": number;
  "24-06-2025": number;
  "25-06-2025": number;
  "26-06-2025": number;
  "27-06-2025": number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  // Risk analytics columns
  risk_score: number;
  default_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors?: Record<string, any>;
}

/**
 * Utility function to get all date-based payment columns dynamically
 * This function now detects actual payment columns from the data
 */
export const getPaymentDateColumns = (sampleData?: any[]): string[] => {
  // If we have sample data, extract actual date columns
  if (sampleData && sampleData.length > 0) {
    const dateColumns: string[] = [];
    const sample = sampleData[0];
    
    // Find all columns that match the DD-MM-YYYY pattern
    for (const key in sample) {
      if (isValidDateColumn(key)) {
        dateColumns.push(key);
      }
    }
    
    // Sort by date for consistent ordering
    return dateColumns.sort((a, b) => {
      const dateA = parseDateFromColumn(a);
      const dateB = parseDateFromColumn(b);
      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.localeCompare(b);
    });
  }
  
  // Fallback to all possible date columns from the interface
  return [
    "19-05-2025", "22-05-2025", "26-05-2025", "27-05-2025", "28-05-2025",
    "30-05-2025", "31-05-2025", "02-06-2025", "04-06-2025", "05-06-2025",
    "07-06-2025", "10-06-2025", "11-06-2025", "12-06-2025", "13-06-2025",
    "14-06-2025", "16-06-2025", "17-06-2025", "18-06-2025", "19-06-2025",
    "20-06-2025", "23-06-2025", "24-06-2025", "25-06-2025", "26-06-2025",
    "27-06-2025"
  ];
};

/**
 * Helper function to parse DD-MM-YYYY date format safely
 */
export const parseDateFromColumn = (columnName: string): Date | null => {
  try {
    // Extract DD-MM-YYYY from column name
    const parts = columnName.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
      const year = parseInt(parts[2], 10);
      
      // Validate the date parts
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2020) {
        const date = new Date(year, month, day);
        // Verify the date is valid (handles cases like Feb 30th)
        if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          return date;
        }
      }
    }
    return null;
  } catch (error) {
    console.warn(`Failed to parse date from column: ${columnName}`, error);
    return null;
  }
};

/**
 * Utility function to get user-friendly date labels with proper error handling
 */
export const getDateLabel = (columnName: string): string => {
  const parsedDate = parseDateFromColumn(columnName);
  
  if (parsedDate) {
    return parsedDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  // Fallback to raw column name if parsing fails
  return columnName;
};

/**
 * Validate if a column name represents a valid date
 */
export const isValidDateColumn = (columnName: string): boolean => {
  return parseDateFromColumn(columnName) !== null;
};
