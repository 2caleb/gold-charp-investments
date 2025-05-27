
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import UserSection from './UserSection';
import EnhancedNavLinks from './EnhancedNavLinks';
import GoldCharpLogo from '@/components/logo/GoldCharpLogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <GoldCharpLogo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                GoldCharp Finance
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden for now as it's handled by Layout */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <UserSection />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <UserSection />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <GoldCharpLogo className="h-8 w-auto" />
                    <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                      GoldCharp Finance
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4">
                    <EnhancedNavLinks 
                      isMobile={true} 
                      onLinkClick={() => setIsOpen(false)} 
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
