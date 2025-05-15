
import React from 'react';
import { Loader2 } from 'lucide-react';
import GoldCharpLogo from '@/components/logo/GoldCharpLogo';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Not used anymore but kept for compatibility
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-700 mb-4" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  // Allow access to all authenticated users regardless of role
  return <>{children}</>;
};

export default RoleBasedRoute;
