
// Utility functions for sophisticated client data matching and normalization

export interface ClientMatchScore {
  client: any;
  application: any;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'phone' | 'id' | 'partial';
}

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

// Normalize names for consistent matching
export const normalizeName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(mr|mrs|ms|dr|prof)\b/g, '') // Remove titles
    .trim();
};

// Calculate string similarity using Levenshtein distance
export const calculateSimilarity = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
};

// Match clients to applications using multiple strategies
export const matchClientToApplications = (client: any, applications: any[]): any[] => {
  const matches: ClientMatchScore[] = [];
  
  const normalizedClientName = normalizeName(client.full_name);
  const normalizedClientPhone = normalizePhoneNumber(client.phone_number);
  const clientIdNumber = client.id_number?.toLowerCase().trim();
  
  applications.forEach(application => {
    const normalizedAppName = normalizeName(application.client_name);
    const normalizedAppPhone = normalizePhoneNumber(application.phone_number);
    const appIdNumber = application.id_number?.toLowerCase().trim();
    
    let score = 0;
    let matchType: ClientMatchScore['matchType'] = 'partial';
    
    // Exact name match (highest priority)
    if (normalizedClientName === normalizedAppName) {
      score = 100;
      matchType = 'exact';
    }
    // Phone number match (very high priority)
    else if (normalizedClientPhone && normalizedAppPhone && normalizedClientPhone === normalizedAppPhone) {
      score = 95;
      matchType = 'phone';
    }
    // ID number match (very high priority)
    else if (clientIdNumber && appIdNumber && clientIdNumber === appIdNumber) {
      score = 95;
      matchType = 'id';
    }
    // Fuzzy name match
    else if (normalizedClientName && normalizedAppName) {
      const nameSimilarity = calculateSimilarity(normalizedClientName, normalizedAppName);
      if (nameSimilarity >= 0.8) {
        score = nameSimilarity * 90;
        matchType = 'fuzzy';
      }
      // Partial name match (check if one name contains the other)
      else if (normalizedClientName.includes(normalizedAppName) || normalizedAppName.includes(normalizedClientName)) {
        score = 75;
        matchType = 'partial';
      }
    }
    
    // Only include matches with reasonable confidence
    if (score >= 70) {
      matches.push({
        client,
        application,
        score,
        matchType
      });
    }
  });
  
  // Sort by score and return applications
  return matches
    .sort((a, b) => b.score - a.score)
    .map(match => match.application);
};

// Define application status categories
export const getApplicationStatusCategory = (status: string): 'active' | 'approved' | 'rejected' | 'completed' => {
  const normalizedStatus = status.toLowerCase().replace('_', ' ').trim();
  
  switch (normalizedStatus) {
    case 'submitted':
    case 'pending manager':
    case 'pending director':
    case 'pending ceo':
    case 'pending chairperson':
    case 'under review':
    case 'in review':
    case 'processing':
      return 'active';
    
    case 'approved':
    case 'disbursed':
    case 'completed':
      return 'approved';
    
    case 'rejected':
    case 'declined':
    case 'cancelled':
      return 'rejected';
    
    default:
      // If status is unclear, consider it active if it's not explicitly negative
      return normalizedStatus.includes('reject') || normalizedStatus.includes('decline') || normalizedStatus.includes('cancel') 
        ? 'rejected' 
        : 'active';
  }
};

// Calculate enhanced client statistics
export const calculateClientStatistics = (applications: any[]) => {
  const activeApplications = applications.filter(app => 
    getApplicationStatusCategory(app.status) === 'active'
  ).length;
  
  const approvedLoans = applications.filter(app => 
    getApplicationStatusCategory(app.status) === 'approved'
  ).length;
  
  const totalLoanAmount = applications.reduce((sum, app) => {
    // Handle different loan amount formats
    let amount = 0;
    if (typeof app.loan_amount === 'string') {
      amount = parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0;
    } else if (typeof app.loan_amount === 'number') {
      amount = app.loan_amount;
    }
    return sum + amount;
  }, 0);
  
  return {
    totalApplications: applications.length,
    activeApplications,
    approvedLoans,
    totalLoanAmount
  };
};
