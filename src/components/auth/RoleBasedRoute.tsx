
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRolePermissions, Role } from '@/hooks/use-role-permissions';
import { Loader2 } from 'lucide-react';
import GoldCharpLogo from '@/components/logo/GoldCharpLogo';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/' 
}) => {
  const { userRole, isLoading, canAccessFullInterface } = useRolePermissions();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-700 mb-4" />
        <p className="text-gray-600 text-lg">Loading permissions...</p>
      </div>
    );
  }

  // Special case: if user has full interface access (CEO, Chairperson, IT personnel),
  // allow them to access any route regardless of specific role
  if (canAccessFullInterface) {
    return <>{children}</>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <GoldCharpLogo size="large" className="mb-8" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          You don't have the necessary permissions to access this section.
        </p>
        <Navigate to={redirectTo} replace />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
