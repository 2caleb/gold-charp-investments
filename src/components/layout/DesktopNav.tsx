
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavLinks from './NavLinks';
import UserSection from './UserSection';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const DesktopNav = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDataCollectionClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to login to access this feature.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      navigate('/staff/data-collection');
    }
  };

  return (
    <nav className="hidden md:flex items-center">
      {/* Compact Navigation Menu - Fixed to prevent flickering */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-sm font-medium hover:text-purple-700 dark:hover:text-purple-400">
              Quick Links
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex flex-col p-4 w-[220px] gap-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'About', href: '/about' },
                  { name: 'Properties', href: '/properties' },
                  { name: 'Loans', href: '/loans' },
                  { name: 'Services', href: '/services' },
                  { name: 'Calculator', href: '/calculator' },
                  { name: 'Contact', href: '/contact' },
                ].map((link) => (
                  <li key={link.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={link.href}
                        className={cn(
                          "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          "text-sm font-medium"
                        )}
                      >
                        {link.name}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      {/* Show Data Collection button to all authenticated users */}
      {isAuthenticated && (
        <Button
          onClick={handleDataCollectionClick}
          variant="ghost"
          size="sm"
          className="font-medium transition-colors duration-300 flex items-center gap-1 hover:scale-105 transform mr-2 ml-2"
        >
          <FileText size={16} />
          <span className="whitespace-nowrap">Data Collection</span>
        </Button>
      )}
      
      <div className="flex items-center">
        {/* Always show Contact Us button */}
        <Link to="/contact" className="mr-2">
          <Button variant="default" size="sm" className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition-transform duration-300 hover:scale-105">
            Contact Us
          </Button>
        </Link>
        
        <UserSection />
      </div>
    </nav>
  );
};

export default DesktopNav;
