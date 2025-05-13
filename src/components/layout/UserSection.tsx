
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

const getRoleBadgeColor = (role: string) => {
  const roleColors = {
    'field_officer': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'director': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'ceo': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'user': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  
  return roleColors[role] || roleColors['user'];
};

const formatRoleTitle = (role: string) => {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const UserSection = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  
  // Fetch user profile data when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
        }
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated, user]);
  
  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
    : user?.email?.slice(0, 2).toUpperCase() || 'U';
    
  const displayName = profile?.full_name || user?.email || 'User';
  const userRole = profile?.role || 'user';

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
        <Link to="/register">
          <Button size="sm">Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full flex items-center justify-center">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInitials}`} alt={displayName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={`mt-2 ${getRoleBadgeColor(userRole)}`}
              >
                {formatRoleTitle(userRole)}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex w-full items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSection;
