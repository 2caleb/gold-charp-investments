
// Phone number normalization and matching utilities

// Normalize phone numbers for consistent matching
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle Uganda phone numbers
  if (digitsOnly.startsWith('256')) {
    return digitsOnly; // Already in international format
  } else if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return '256' + digitsOnly.substring(1); // Convert 0xxx to 256xxx
  } else if (digitsOnly.length === 9) {
    return '256' + digitsOnly; // Add country code
  }
  
  return digitsOnly;
};
