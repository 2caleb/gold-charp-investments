
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavLinks from './NavLinks';
import UserSection from './UserSection';
import { useIsMobile } from '@/hooks/use-mobile';

// Props type for the MobileNav component
interface MobileNavProps {
  isOpen?: boolean; 
  onClose?: () => void;
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(isOpen || false);
  
  // Sync the sheet open state with the isOpen prop
  useEffect(() => {
    setSheetOpen(isOpen || false);
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
      <SheetContent>
        <SheetHeader className="mb-6">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Explore our services</SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-6">
          <NavLinks isMobile={true} onClick={handleActionComplete} />
          <UserSection onActionComplete={handleActionComplete} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
