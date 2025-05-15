
import { useState } from 'react';
import { useUser } from '@/hooks/use-user';

export type Role = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairperson' | 'client' | 'it_personnel';

export function useRolePermissions() {
  const { userProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the actual user role from profile, but don't restrict permissions based on it
  const userRole = userProfile?.role as Role | null;
  
  // Map workflow stages to roles - defined before use
  const roleToStage: Record<string, string> = {
    'field_officer': 'field_officer',
    'manager': 'manager',
    'director': 'director',
    'ceo': 'ceo',
    'chairperson': 'chairperson'
  };
  
  // Now we can use roleToStage
  const currentWorkflowStage = userRole ? roleToStage[userRole] : null;
  
  // Grant all permissions to all authenticated users
  const canCollectData = true;
  const canReviewApplications = true;
  const canAssessRisk = true;
  const canApprove = true;
  const canFinalizeApproval = true;
  const canViewAllApplications = true;
  const canAccessDashboard = true;
  const canAccessFullInterface = true;

  return {
    userRole,
    isLoading,
    currentWorkflowStage,
    // Access permissions - all set to true
    canCollectData,
    canReviewApplications,
    canAssessRisk,
    canApprove,
    canFinalizeApproval,
    canViewAllApplications,
    canAccessDashboard,
    canAccessFullInterface,
    // Role checks - still based on actual role for display purposes
    isFieldOfficer: userRole === 'field_officer',
    isManager: userRole === 'manager',
    isDirector: userRole === 'director',
    isCEO: userRole === 'ceo',
    isChairperson: userRole === 'chairperson',
    isITPersonnel: userRole === 'it_personnel',
    isClient: userRole === 'client'
  };
}
