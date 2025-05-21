
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
        
        // First, try to get user profile with role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // Not found
          throw profileError;
        }
        
        if (profileData) {
          setUserRole(profileData.role as UserRole);
          setUserName(profileData.full_name || null);
          setIsLoading(false);
          return;
        }
        
        // Try from roles table
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') { // Not found
          throw roleError;
        }
        
        if (roleData) {
          setUserRole(roleData.role as UserRole);
          setUserName(roleData.full_name || null);
        } else {
          // Fetch user metadata as fallback
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          // Default to 'user' role
          setUserRole('user');
          setUserName(userData?.user?.user_metadata?.full_name || null);
        }
        
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

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userRole || !requiredRole) return false;
    
    // Define role hierarchy (higher index = more permissions)
    const roleHierarchy = [
      'user',
      'field_officer',
      'manager',
      'director',
      'ceo',
      'chairperson'
    ];
    
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    // User has permission if their role is at or above the required level
    return userRoleIndex >= requiredRoleIndex;
  };

  // Helper functions to check specific roles
  const isFieldOfficer = userRole === 'field_officer' || hasPermission('field_officer');
  const isManager = userRole === 'manager' || hasPermission('manager');
  const isDirector = userRole === 'director' || hasPermission('director');
  const isCEO = userRole === 'ceo' || hasPermission('ceo');
  const isChairperson = userRole === 'chairperson' || hasPermission('chairperson');

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
    isChairperson
  };
}
