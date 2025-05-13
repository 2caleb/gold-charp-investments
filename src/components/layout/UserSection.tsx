
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, LogIn, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserSectionProps {
  isMobile?: boolean;
  onActionComplete?: () => void;
}

const UserSection = ({ isMobile = false, onActionComplete = () => {} }: UserSectionProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  
  // Get user's name from metadata if available
  const userName = user?.user_metadata?.full_name || 'User';
  
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
        <div className={`text-sm font-medium text-purple-700 dark:text-purple-400 ${isMobile ? 'px-4 py-2 flex items-center gap-2' : ''}`}>
          {isMobile && <User size={16} />}
          <span>Hello, {isMobile ? userName : userName.split(' ')[0]}</span>
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
