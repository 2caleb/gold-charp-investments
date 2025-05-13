
import React from 'react';
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
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    toast({
      title: "Authentication Required",
      description: "You need to login to access this section.",
      variant: "destructive",
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, allow access
  return <>{children}</>;
};

export default StaffRoute;
