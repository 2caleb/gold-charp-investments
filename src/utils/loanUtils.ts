
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

/**
 * Generate a rejection reason message based on various factors
 * 
 * @param role The role of the person rejecting the loan
 * @param employmentStatus The employment status of the applicant
 * @param loanAmount The requested loan amount
 * @param monthlyIncome The monthly income of the applicant
 * @returns A formatted rejection reason
 */
export function generateRejectionReason(
  role: 'manager' | 'director' | 'ceo' | 'chairperson', 
  employmentStatus: string,
  loanAmount: string,
  monthlyIncome: string
): string {
  const numericLoanAmount = parseFloat(loanAmount.replace(/,/g, ''));
  const numericMonthlyIncome = parseFloat(monthlyIncome.replace(/,/g, ''));
  
  // Calculate debt-to-income ratio (loan amount / annual income)
  const annualIncome = numericMonthlyIncome * 12;
  const debtToIncomeRatio = numericLoanAmount / annualIncome;
  
  let reason = '';
  
  // Common rejections based on financial metrics
  if (debtToIncomeRatio > 1) {
    reason = `The requested loan amount exceeds the applicant's annual income. The debt-to-income ratio of ${(debtToIncomeRatio * 100).toFixed(1)}% is too high for approval.`;
  } else if (debtToIncomeRatio > 0.6 && role === 'director') {
    reason = `Risk assessment indicates that the loan-to-income ratio of ${(debtToIncomeRatio * 100).toFixed(1)}% is above our acceptable threshold for this applicant profile.`;
  } else if (employmentStatus === 'unemployed') {
    reason = 'The application has been declined due to the applicant being currently unemployed, representing a high repayment risk.';
  } else {
    // Role-specific rejection templates
    switch (role) {
      case 'manager':
        reason = 'Initial review indicates insufficient documentation or inconsistencies in the provided information. Please ensure all required documents are submitted and information is accurate.';
        break;
      case 'director':
        reason = 'Risk assessment has determined that this loan carries a higher than acceptable risk profile based on current market conditions and the applicant's financial history.';
        break;
      case 'ceo':
        reason = 'The loan application does not align with our current strategic lending priorities or risk appetite. We recommend exploring alternative financing options.';
        break;
      case 'chairperson':
        reason = 'After thorough consideration by the loan committee, this application has been declined based on overall portfolio risk management and current economic factors.';
        break;
    }
  }
  
  return reason;
}

/**
 * Generate a downsizing reason message
 * 
 * @param originalAmount The original requested loan amount
 * @param approvedAmount The approved reduced amount
 * @param monthlyIncome The monthly income of the applicant
 * @returns A formatted reason for downsizing the loan
 */
export function generateDownsizingReason(
  originalAmount: string,
  approvedAmount: string,
  monthlyIncome: string
): string {
  const numericOriginal = parseFloat(originalAmount.replace(/,/g, ''));
  const numericApproved = parseFloat(approvedAmount.replace(/,/g, ''));
  const numericMonthlyIncome = parseFloat(monthlyIncome.replace(/,/g, ''));
  
  const annualIncome = numericMonthlyIncome * 12;
  const originalRatio = numericOriginal / annualIncome;
  const approvedRatio = numericApproved / annualIncome;
  
  const reductionPercentage = ((numericOriginal - numericApproved) / numericOriginal * 100).toFixed(1);
  
  return `The requested loan amount of UGX ${originalAmount} has been adjusted to UGX ${approvedAmount} (a ${reductionPercentage}% reduction) to align with our lending policies. This adjustment ensures a more sustainable debt-to-income ratio of ${(approvedRatio * 100).toFixed(1)}% compared to the original ${(originalRatio * 100).toFixed(1)}%, improving the likelihood of successful repayment.`;
}
