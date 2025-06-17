
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (!amount) return '₦0';
  
  let numAmount: number;
  if (typeof amount === 'string') {
    numAmount = parseFloat(amount.replace(/,/g, ''));
  } else {
    numAmount = amount;
  }
  
  if (isNaN(numAmount)) return '₦0';
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};
