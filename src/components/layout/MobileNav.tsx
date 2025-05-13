
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import NavLinks from './NavLinks';
import UserSection from './UserSection';
import { Link } from 'react-router-dom';
import { useMobileDetect } from '@/hooks/use-mobile';
import ThemeToggle from '../theme/ThemeToggle';

// Props type for the MobileNav component
interface MobileNavProps {
  brandText?: string;
}

const MobileNav = ({ brandText = "Gold Charp Investments" }: MobileNavProps) => {
  const isMobile = useMobileDetect();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  const handleActionComplete = () => {
    // Close the mobile menu when an action is completed
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden flex justify-between items-center w-full">
      <Link 
        to="/" 
        className="text-lg font-serif font-bold hover:text-purple-800 dark:hover:text-purple-400 transition-colors"
      >
        {brandText}
      </Link>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="px-2"
              aria-label="Menu"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="mb-6">
              <SheetTitle>{brandText}</SheetTitle>
              <SheetDescription>Navigation</SheetDescription>
            </SheetHeader>
            
            <div className="flex flex-col gap-6">
              <NavLinks className="flex flex-col gap-4" onActionComplete={handleActionComplete} />
              <UserSection onActionComplete={handleActionComplete} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
