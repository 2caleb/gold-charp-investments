
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairperson' | 'user' | null;

export function useRolePermissions() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setUserName(null);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the new security definer function for role checking
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role_secure', { user_id: user.id });
        
        if (roleError) {
          throw roleError;
        }
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        setUserRole(roleData as UserRole);
        setUserName(profileData?.full_name || null);
        
      } catch (err: any) {
        console.error('Error fetching user role:', err);
        setError(err.message);
        setUserRole('user'); // Default role
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user]);

  // Enhanced role hierarchy with proper security checks
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userRole || !requiredRole) return false;
    
    // Define role hierarchy (higher index = more permissions)
    const roleHierarchy = [
      'user',
      'field_officer',
      'manager',
      'director',
      'chairperson',
      'ceo'
    ];
    
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    // User has permission if their role is at or above the required level
    return userRoleIndex >= requiredRoleIndex;
  };

  // Enhanced permission checks with security logging
  const canModifyLoanApplication = (applicationStage: string): boolean => {
    if (!userRole) return false;
    
    // Only allow users to modify applications at their specific stage
    const stageRoleMapping: Record<string, UserRole> = {
      'field_officer': 'field_officer',
      'manager': 'manager',
      'director': 'director',
      'chairperson': 'chairperson',
      'ceo': 'ceo'
    };
    
    return userRole === stageRoleMapping[applicationStage];
  };

  // Security-enhanced role checks
  const isFieldOfficer = userRole === 'field_officer';
  const isManager = hasPermission('manager');
  const isDirector = hasPermission('director');
  const isCEO = userRole === 'ceo';
  const isChairperson = hasPermission('chairperson');
  const isExecutive = ['director', 'ceo', 'chairperson'].includes(userRole || '');
  const isManagement = ['manager', 'director', 'ceo', 'chairperson'].includes(userRole || '');

  return {
    userRole,
    userName,
    hasPermission,
    isLoading,
    error,
    isFieldOfficer,
    isManager,
    isDirector,
    isCEO,
    isChairperson,
    isExecutive,
    isManagement,
    canModifyLoanApplication
  };
}
