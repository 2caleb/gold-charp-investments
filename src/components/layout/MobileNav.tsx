
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavLinks from './NavLinks';
import UserSection from './UserSection';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
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
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden py-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <NavLinks isMobile onClick={onClose} />
        
        {/* Show Data Collection button in mobile menu for authenticated users */}
        {isAuthenticated && (
          <button
            onClick={handleDataCollectionClick}
            className="font-medium px-4 py-2 text-left rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <FileText size={18} />
            <span>Data Collection</span>
          </button>
        )}
        
        <Link to="/contact" className="w-full" onClick={onClose}>
          <Button variant="default" className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 w-full transition-transform duration-300 hover:scale-105">
            Contact Us
          </Button>
        </Link>
        
        <UserSection isMobile onActionComplete={onClose} />
      </div>
    </div>
  );
};

export default MobileNav;
