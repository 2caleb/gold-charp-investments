
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Building, Calculator, Info, LogIn, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400";
  };

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-white dark:bg-gray-900'} border-b border-gray-200 dark:border-gray-800`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
          <span className="text-2xl font-serif font-bold text-purple-700 dark:text-purple-400">Gold<span className="text-amber-500">Charp</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`${isActive('/')} font-medium transition-colors duration-300 flex items-center gap-1 hover:scale-105 transform`}>
            <Home size={18} />
            <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Home</span>
          </Link>
          <Link to="/properties" className={`${isActive('/properties')} font-medium transition-colors duration-300 flex items-center gap-1 hover:scale-105 transform`}>
            <Building size={18} />
            <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Properties</span>
          </Link>
          <Link to="/loans" className={`${isActive('/loans')} font-medium transition-colors duration-300 flex items-center gap-1 hover:scale-105 transform`}>
            <Building size={18} />
            <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Loans</span>
          </Link>
          <Link to="/calculator" className={`${isActive('/calculator')} font-medium transition-colors duration-300 flex items-center gap-1 hover:scale-105 transform`}>
            <Calculator size={18} />
            <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Calculator</span>
          </Link>
          <Link to="/about" className={`${isActive('/about')} font-medium transition-colors duration-300 flex items-center gap-1 hover:scale-105 transform`}>
            <Info size={18} />
            <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">About Us</span>
          </Link>
          <ThemeToggle />
          <Link to="/contact">
            <Button variant="default" size="sm" className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition-transform duration-300 hover:scale-105">
              Contact Us
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Hello, {user?.fullName?.split(' ')[0]}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50 flex items-center gap-1 transition-transform duration-300 hover:scale-105"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50 flex items-center gap-1 transition-transform duration-300 hover:scale-105">
                <LogIn size={16} />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 focus:outline-none transition-transform duration-300 hover:scale-110"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden py-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`${isActive('/')} font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2`}
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              to="/properties" 
              className={`${isActive('/properties')} font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2`}
              onClick={() => setIsOpen(false)}
            >
              <Building size={18} />
              <span>Properties</span>
            </Link>
            <Link 
              to="/loans" 
              className={`${isActive('/loans')} font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2`}
              onClick={() => setIsOpen(false)}
            >
              <Building size={18} />
              <span>Loans</span>
            </Link>
            <Link 
              to="/calculator" 
              className={`${isActive('/calculator')} font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2`}
              onClick={() => setIsOpen(false)}
            >
              <Calculator size={18} />
              <span>Calculator</span>
            </Link>
            <Link 
              to="/about" 
              className={`${isActive('/about')} font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2`}
              onClick={() => setIsOpen(false)}
            >
              <Info size={18} />
              <span>About Us</span>
            </Link>
            <Link to="/contact" className="w-full" onClick={() => setIsOpen(false)}>
              <Button variant="default" className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 w-full transition-transform duration-300 hover:scale-105">
                Contact Us
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <User size={16} />
                  <span>{user?.fullName}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50 w-full flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-105"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/login" className="w-full" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50 w-full flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-105">
                  <LogIn size={16} />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
