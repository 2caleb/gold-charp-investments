
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface UserSectionProps {
  onActionComplete?: () => void;
}

interface UserProfile {
  full_name: string | null;
  role: string | null;
}

const UserSection = ({ onActionComplete }: UserSectionProps) => {
  const { user, signOut, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch user profile from the profiles table when auth state changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          setLoadingProfile(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setProfile(data);
            console.log('Profile data fetched:', data);
          }
        } catch (error) {
          console.error('Error in profile fetch:', error);
        } finally {
          setLoadingProfile(false);
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
    try {
      console.log("Sign out button clicked");
      await signOut();
      if (onActionComplete) onActionComplete();
      navigate('/');
      console.log("Sign out completed");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
    if (onActionComplete) onActionComplete();
  };

  const handleRegister = () => {
    navigate('/register');
    if (onActionComplete) onActionComplete();
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (user) {
    // Get user information from the profiles table instead of auth metadata
    const fullName = profile?.full_name || 'User';
    const role = profile?.role || 'Client';
    
    return (
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium">{fullName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{role}</span>
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
