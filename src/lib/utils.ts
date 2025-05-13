
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'UGX'): string {
  const formatter = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}
