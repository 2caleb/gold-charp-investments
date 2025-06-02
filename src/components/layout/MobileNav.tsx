
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavLinks from './NavLinks';
import UserSection from './UserSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

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
      <SheetContent className="border-none bg-white dark:bg-gray-900 shadow-xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif text-purple-700 dark:text-purple-400">Navigation</SheetTitle>
          <SheetDescription className="text-gray-600 dark:text-gray-400">Explore our premium banking services</SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {sheetOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, staggerChildren: 0.1 }}
                className="space-y-6"
              >
                <NavLinks className="flex-col space-y-4" onClick={handleActionComplete} />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <UserSection onActionComplete={handleActionComplete} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
