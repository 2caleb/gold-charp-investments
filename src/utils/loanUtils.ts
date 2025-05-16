
/**
 * Utility functions for loan processing
 */

/**
 * Generates a unique loan identification number with a specific format
 * Format: LN-YYYY-MM-XXXXX (where XXXXX is a random 5-digit number)
 * 
 * @returns A formatted loan identification number
 */
export function generateLoanIdentificationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Generate a random 5-digit number
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  
  // Combine into format LN-YYYY-MM-XXXXX
  return `LN-${year}-${month}-${randomDigits}`;
}

/**
 * Validates if a string has the correct loan ID format
 * 
 * @param loanId The loan ID to validate
 * @returns True if the loan ID has the correct format
 */
export function isValidLoanIdFormat(loanId: string): boolean {
  // Format: LN-YYYY-MM-XXXXX
  const regex = /^LN-\d{4}-\d{2}-\d{5}$/;
  return regex.test(loanId);
}
