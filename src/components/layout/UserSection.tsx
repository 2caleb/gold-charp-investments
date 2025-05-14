
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface UserSectionProps {
  onActionComplete?: () => void;
}

const UserSection = ({ onActionComplete }: UserSectionProps) => {
  const { user, signOut, isLoading, session } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile when auth state changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          }
        } catch (error) {
          console.error('Error in profile fetch:', error);
        }
      }
    };

    if (user?.id) {
      // Use setTimeout to avoid Supabase auth deadlock
      setTimeout(() => {
        fetchUserProfile();
      }, 0);
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    if (onActionComplete) onActionComplete();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/login');
    if (onActionComplete) onActionComplete();
  };

  const handleRegister = () => {
    navigate('/register');
    if (onActionComplete) onActionComplete();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    // Extract user information directly from auth user metadata
    // This contains data that was set during registration
    const fullName = user.user_metadata?.full_name || 'User';
    const role = user.user_metadata?.role || 'Client';
    
    // Get initials for avatar
    const initials = fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return (
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        
        {/* User info display with avatar */}
        <div className="hidden md:flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-purple-200">
            <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{fullName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{role}</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => navigate('/profile')}
        >
          <User className="h-4 w-4" />
          <span className="hidden md:block">Profile</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:block">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleSignIn}>
        Sign In
      </Button>
      <Button variant="default" size="sm" onClick={handleRegister}>
        Register
      </Button>
    </div>
  );
};

export default UserSection;
