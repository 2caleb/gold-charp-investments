
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';

export type Role = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairperson' | 'client' | 'it_personnel';

export function useRolePermissions() {
  const { userProfile, isLoading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the actual user role from profile
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

  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
    }
  }, [userLoading]);
  
  // Grant permissions based on role
  const canCollectData = !!userRole;
  const canReviewApplications = ['manager', 'director', 'ceo', 'chairperson'].includes(userRole || '');
  const canAssessRisk = ['director', 'ceo', 'chairperson'].includes(userRole || '');
  const canApprove = ['ceo', 'chairperson'].includes(userRole || '');
  const canFinalizeApproval = userRole === 'chairperson';
  const canViewAllApplications = !!userRole;
  const canAccessDashboard = !!userRole;
  const canAccessFullInterface = !!userRole;

  return {
    userRole,
    isLoading,
    currentWorkflowStage,
    // Access permissions based on role
    canCollectData,
    canReviewApplications,
    canAssessRisk,
    canApprove,
    canFinalizeApproval,
    canViewAllApplications,
    canAccessDashboard,
    canAccessFullInterface,
    // Role checks
    isFieldOfficer: userRole === 'field_officer',
    isManager: userRole === 'manager',
    isDirector: userRole === 'director',
    isCEO: userRole === 'ceo',
    isChairperson: userRole === 'chairperson',
    isITPersonnel: userRole === 'it_personnel',
    isClient: userRole === 'client'
  };
}
