
// Main client data matching orchestrator

import { normalizeName, calculateSimilarity } from './nameMatching';
import { normalizePhoneNumber } from './phoneMatching';

export interface ClientMatchScore {
  client: any;
  application: any;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'phone' | 'id' | 'partial';
}

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

// Re-export utilities for backward compatibility
export { normalizeName, calculateSimilarity } from './nameMatching';
export { normalizePhoneNumber } from './phoneMatching';
export { getApplicationStatusCategory, calculateClientStatistics } from './clientStatistics';
