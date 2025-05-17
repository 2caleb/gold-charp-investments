
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StaffRoleProps {
  children: React.ReactNode;
  roles?: string[]; // Make roles optional
}

// This component protects routes that should only be accessible to authenticated users
const StaffRoute = ({ children, roles = [] }: StaffRoleProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use useEffect to show the toast notification instead of doing it during render
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to login to access this section.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, toast]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has any of those roles
  // This is just basic role checking - you might need to enhance based on your user data structure
  if (roles.length > 0 && user?.user_metadata?.role) {
    const userRole = user.user_metadata.role;
    if (!roles.includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this section.",
        variant: "destructive",
      });
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required role (if specified), allow access
  return <>{children}</>;
};

export default StaffRoute;
