
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import NavLinks from './NavLinks';
import UserSection from './UserSection';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '../theme/ThemeToggle';

// Props type for the MobileNav component
interface MobileNavProps {
  brandText?: string;
  isOpen?: boolean; 
  onClose?: () => void;
}

const MobileNav = ({ brandText = "Gold Charp Investments", isOpen, onClose }: MobileNavProps) => {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(isOpen || false);
  
  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };
  
  const handleActionComplete = () => {
    // Close the mobile menu when an action is completed
    setSheetOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="lg:hidden flex justify-between items-center w-full">
      <Link 
        to="/" 
        className="text-lg font-serif font-bold hover:text-purple-800 dark:hover:text-purple-400 transition-colors"
      >
        {brandText}
      </Link>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="px-2"
              aria-label="Menu"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[280px] sm:w-[350px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl">{brandText}</SheetTitle>
              <SheetDescription>Navigation</SheetDescription>
            </SheetHeader>
            
            <div className="flex flex-col gap-8 py-4">
              <NavLinks isMobile={true} onClick={handleActionComplete} />
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <UserSection />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
