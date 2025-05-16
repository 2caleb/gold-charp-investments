
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GoldCharpLogo from '@/components/logo/GoldCharpLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/use-user';
import { useRolePermissions } from '@/hooks/use-role-permissions';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}) => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { userProfile, isLoading: profileLoading } = useUser();
  const { userRole } = useRolePermissions();
  
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-700 mb-4" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  // If no specific roles are required, allow access to all authenticated users
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(userRole || '');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
