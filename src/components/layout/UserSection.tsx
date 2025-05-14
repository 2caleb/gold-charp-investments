
import React from 'react';
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';

interface UserSectionProps {
  onActionComplete?: () => void;
}

const UserSection = ({ onActionComplete }: UserSectionProps) => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

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
    return (
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
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
