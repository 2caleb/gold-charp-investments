
// Security utility functions for input validation and sanitization

export const validateMonetaryAmount = (amount: string): string | null => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return 'Please enter a valid number';
  }
  
  if (numAmount < 0) {
    return 'Amount cannot be negative';
  }
  
  if (numAmount > 10000000) { // 10 million limit
    return 'Amount exceeds maximum allowed value';
  }
  
  // Check for reasonable decimal places (max 2)
  if (amount.includes('.') && amount.split('.')[1].length > 2) {
    return 'Amount can have maximum 2 decimal places';
  }
  
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  if (cleanPhone.length > 15) {
    return 'Phone number cannot exceed 15 digits';
  }
  
  // Uganda phone number patterns
  const ugandaPattern = /^(\+256|0)?[0-9]{9}$/;
  if (!ugandaPattern.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid Ugandan phone number';
  }
  
  return null;
};

export const validateIdNumber = (idNumber: string): string | null => {
  // Remove spaces and convert to uppercase
  const cleanId = idNumber.replace(/\s/g, '').toUpperCase();
  
  if (cleanId.length < 8) {
    return 'ID number must be at least 8 characters';
  }
  
  if (cleanId.length > 20) {
    return 'ID number cannot exceed 20 characters';
  }
  
  // Check for alphanumeric characters only
  if (!/^[A-Z0-9]+$/.test(cleanId)) {
    return 'ID number can only contain letters and numbers';
  }
  
  return null;
};

export const sanitizeTextInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateFileUpload = (file: File): string | null => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return 'File type not allowed. Please upload PDF, Excel, or image files only.';
  }
  
  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return 'File size cannot exceed 10MB';
  }
  
  return null;
};

export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + visible;
};

export const detectSuspiciousActivity = (
  userActions: Array<{ action: string; timestamp: Date }>
): boolean => {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  
  // Check for too many actions in the last minute
  const recentActions = userActions.filter(action => action.timestamp > oneMinuteAgo);
  
  if (recentActions.length > 10) {
    return true; // Potential spam/bot activity
  }
  
  // Check for repeated failed login attempts
  const failedLogins = recentActions.filter(action => action.action === 'login_failed');
  if (failedLogins.length > 3) {
    return true;
  }
  
  return false;
};
