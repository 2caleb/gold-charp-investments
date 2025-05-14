
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserIcon } from 'lucide-react';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

export default function UserSection() {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // If auth is still loading, show a placeholder
  if (loading) {
    return <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>;
  }

  // If user is not logged in, show login and register buttons
  if (!user) {
    return (
      <div className="flex space-x-2">
        <Button variant="outline" asChild>
          <Link to="/login">Log in</Link>
        </Button>
        <Button className="bg-purple-700 hover:bg-purple-800" asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  // If user is logged in, show the profile menu
  return (
    <div className="flex items-center space-x-4">
      <NotificationsDropdown />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarFallback className="bg-purple-100 text-purple-800">
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
