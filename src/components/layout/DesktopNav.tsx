
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '../theme/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavLinks from './NavLinks';
import UserSection from './UserSection';

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
    <nav className="hidden md:flex items-center space-x-8">
      <div className="flex items-center space-x-8">
        <NavLinks />
      </div>
      
      {/* Show Data Collection button only for authenticated users */}
      {isAuthenticated && (
        <Button
          onClick={handleDataCollectionClick}
          variant="ghost"
          className="font-medium transition-colors duration-300 flex items-center gap-2 hover:scale-105 transform"
        >
          <FileText size={18} />
          <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
            Data Collection
          </span>
        </Button>
      )}
      
      <div className="flex items-center space-x-6">
        <ThemeToggle />
        
        <Link to="/contact">
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
