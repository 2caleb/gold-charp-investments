
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Role = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairperson' | 'client';

export function useRolePermissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canCollectData, setCanCollectData] = useState(false);
  const [canReviewApplications, setCanReviewApplications] = useState(false);
  const [canAssessRisk, setCanAssessRisk] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canViewAllApplications, setCanViewAllApplications] = useState(false);

  // Fetch user role from profiles table
  useEffect(() => {
    const getUserRole = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch user role information',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (data) {
          setUserRole(data.role as Role);
          
          // Set permissions based on role
          switch(data.role) {
            case 'field_officer':
              setCanCollectData(true);
              break;
            case 'manager':
              setCanReviewApplications(true);
              setCanViewAllApplications(true);
              break;
            case 'director':
              setCanAssessRisk(true);
              setCanViewAllApplications(true);
              break;
            case 'ceo':
            case 'chairperson':
              setCanApprove(true);
              setCanViewAllApplications(true);
              break;
            case 'client':
              // Client can only see their own data
              break;
            default:
              break;
          }
        }
      } catch (err) {
        console.error('Error in role permissions hook:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getUserRole();
  }, [user, toast]);

  return {
    userRole,
    isLoading,
    canCollectData,
    canReviewApplications,
    canAssessRisk,
    canApprove,
    canViewAllApplications,
    isFieldOfficer: userRole === 'field_officer',
    isManager: userRole === 'manager',
    isDirector: userRole === 'director',
    isCEO: userRole === 'ceo',
    isChairperson: userRole === 'chairperson',
    isClient: userRole === 'client'
  };
}
