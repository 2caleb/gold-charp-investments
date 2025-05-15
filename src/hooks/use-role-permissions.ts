
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

export type Role = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairperson' | 'client' | 'it_personnel';

export function useRolePermissions() {
  const { userProfile, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Role-based permissions
  const [canCollectData, setCanCollectData] = useState(false);
  const [canReviewApplications, setCanReviewApplications] = useState(false);
  const [canAssessRisk, setCanAssessRisk] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canFinalizeApproval, setCanFinalizeApproval] = useState(false);
  const [canViewAllApplications, setCanViewAllApplications] = useState(false);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);
  const [canAccessFullInterface, setCanAccessFullInterface] = useState(false);

  // Map workflow stages to roles
  const [currentWorkflowStage, setCurrentWorkflowStage] = useState<string | null>(null);
  const roleToStage: Record<string, string> = {
    'field_officer': 'field_officer',
    'manager': 'manager',
    'director': 'director',
    'ceo': 'ceo',
    'chairperson': 'chairperson'
  };

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    try {
      if (userProfile?.role) {
        const role = userProfile.role as Role;
        setUserRole(role);
        
        // Set permissions based on role
        switch(role) {
          case 'field_officer':
            setCanCollectData(true);
            setCurrentWorkflowStage('field_officer');
            break;
          case 'manager':
            setCanReviewApplications(true);
            setCanViewAllApplications(true);
            setCurrentWorkflowStage('manager');
            setCanAccessDashboard(true);
            break;
          case 'director':
            setCanAssessRisk(true);
            setCanViewAllApplications(true);
            setCurrentWorkflowStage('director');
            setCanAccessDashboard(true);
            break;
          case 'ceo':
            setCanApprove(true);
            setCanViewAllApplications(true);
            setCurrentWorkflowStage('ceo');
            setCanAccessDashboard(true);
            setCanAccessFullInterface(true); // CEO can access the full interface
            break;
          case 'chairperson':
            setCanFinalizeApproval(true);
            setCanViewAllApplications(true);
            setCurrentWorkflowStage('chairperson');
            setCanAccessDashboard(true);
            setCanAccessFullInterface(true); // Chairperson can access the full interface
            break;
          case 'it_personnel':
            setCanViewAllApplications(true);
            setCanAccessDashboard(true);
            setCanAccessFullInterface(true); // IT personnel can access the full interface
            break;
          case 'client':
            // Client can only see their own data
            break;
          default:
            console.warn(`Unknown role: ${role}`);
            break;
        }
      }
    } catch (err) {
      console.error('Error in role permissions hook:', err);
      toast({
        title: 'Error',
        description: 'Failed to load user permissions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isUserLoading, toast]);

  return {
    userRole,
    isLoading,
    currentWorkflowStage,
    // Access permissions
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
