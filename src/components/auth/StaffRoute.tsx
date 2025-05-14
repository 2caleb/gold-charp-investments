
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StaffRoleProps {
  children: React.ReactNode;
}

// This component protects routes that should only be accessible to authenticated users
const StaffRoute = ({ children }: StaffRoleProps) => {
  const { isAuthenticated, isLoading } = useAuth();
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

  // User is authenticated, allow access
  return <>{children}</>;
};

export default StaffRoute;
