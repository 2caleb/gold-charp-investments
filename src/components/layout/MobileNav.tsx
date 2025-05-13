
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import NavLinks from './NavLinks';
import UserSection from './UserSection';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Props type for the MobileNav component
interface MobileNavProps {
  brandText?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const MobileNav = ({ brandText = "Gold Charp Investments", isOpen = false, onClose }: MobileNavProps) => {
  const [sheetOpen, setSheetOpen] = useState(isOpen);
  
  // Update internal state when prop changes
  useEffect(() => {
    setSheetOpen(isOpen);
  }, [isOpen]);
  
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
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="w-[280px] sm:w-[320px]">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl font-serif text-purple-700 dark:text-purple-400">
              Gold<span className="text-amber-500">Charp</span>
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleSheetOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <SheetDescription>Navigation</SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-8 py-4">
          <NavLinks 
            isMobile={true} 
            onClick={handleActionComplete} 
            className="space-y-2" 
          />
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <UserSection />
          </div>
          
          <Link 
            to="/contact" 
            className="mt-4 inline-flex items-center justify-center rounded-md bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 px-4 py-2 text-sm font-medium text-white shadow transition-colors"
            onClick={handleActionComplete}
          >
            Contact Us
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
