
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';

interface StaffRoleProps {
  children: React.ReactNode;
}

// Staff roles in order of hierarchy (lowest to highest)
export type StaffRole = 'field_officer' | 'manager' | 'director' | 'ceo';

// This component protects routes that should only be accessible to staff members
const StaffRoute = ({ children }: StaffRoleProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if the user has any staff role
  const isStaff = user?.user_metadata?.role && ['field_officer', 'manager', 'director', 'ceo'].includes(user.user_metadata.role);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    // User is authenticated but not a staff member
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this area.",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StaffRoute;
