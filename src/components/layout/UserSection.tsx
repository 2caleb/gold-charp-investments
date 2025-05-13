
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, LogIn, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserSectionProps {
  isMobile?: boolean;
  onActionComplete?: () => void;
}

const UserSection = ({ isMobile = false, onActionComplete = () => {} }: UserSectionProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>('User');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleDisplay, setRoleDisplay] = useState<string>('');
  
  useEffect(() => {
    // Get user data from Supabase if authenticated
    const fetchUserData = async () => {
      if (isAuthenticated && user) {
        try {
          // Try to get user data from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to metadata if available
            if (user.user_metadata?.full_name) {
              setUserName(user.user_metadata.full_name);
            } else if (user.email) {
              // Use email as last resort, but only display name part
              const emailName = user.email.split('@')[0];
              setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
            }
          } else if (data) {
            // Set name from profiles table
            if (data.full_name) {
              setUserName(data.full_name);
            }
            
            // Set role from profiles table
            if (data.role) {
              setUserRole(data.role);
              
              // Format role for display
              switch (data.role) {
                case 'field_officer':
                  setRoleDisplay('Field Officer');
                  break;
                case 'manager':
                  setRoleDisplay('Manager');
                  break;
                case 'director':
                  setRoleDisplay('Director');
                  break;
                case 'ceo':
                  setRoleDisplay('CEO');
                  break;
                default:
                  setRoleDisplay('Client');
              }
            }
          }
        } catch (error) {
          console.error('Error in fetching user data:', error);
        }
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, user]);
  
  const handleLogout = async () => {
    await logout();
    toast({
      title: "Successfully logged out",
      description: "You have been logged out of your account",
    });
    onActionComplete();
  };
  
  if (isAuthenticated) {
    return (
      <>
        <div className={`text-sm font-medium text-purple-700 dark:text-purple-400 ${isMobile ? 'px-4 py-2 flex flex-col gap-1' : ''}`}>
          <div className="flex items-center gap-2">
            {isMobile && <User size={16} />}
            <span>Hello, {isMobile ? userName : userName.split(' ')[0]}</span>
          </div>
          {userRole && (
            <div className="text-xs text-purple-500 dark:text-purple-300 font-medium">
              {roleDisplay}
            </div>
          )}
        </div>
        <Button 
          variant="outline" 
          size={isMobile ? "default" : "sm"} 
          onClick={handleLogout}
          className={`border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50 flex items-center gap-1 transition-transform duration-300 hover:scale-105 ${isMobile ? 'w-full justify-center' : ''}`}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </>
    );
  }
  
  return (
    <Link to="/login" className={isMobile ? "w-full" : ""} onClick={onActionComplete}>
      <Button 
        variant="outline" 
        size={isMobile ? "default" : "sm"} 
        className={`border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50 flex items-center gap-1 transition-transform duration-300 hover:scale-105 ${isMobile ? 'w-full justify-center' : ''}`}
      >
        <LogIn size={16} />
        <span>Login</span>
      </Button>
    </Link>
  );
};

export default UserSection;
