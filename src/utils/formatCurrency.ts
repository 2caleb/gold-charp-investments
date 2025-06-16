
/**
 * Format currency values for display
 */
export const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return 'UGX 0';
  }
  
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};
