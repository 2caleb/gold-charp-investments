
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (!amount) return 'UGX 0';
  
  let numAmount: number;
  if (typeof amount === 'string') {
    numAmount = parseFloat(amount.replace(/,/g, ''));
  } else {
    numAmount = amount;
  }
  
  if (isNaN(numAmount)) return 'UGX 0';
  
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};
