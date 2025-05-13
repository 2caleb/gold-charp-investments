
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Calculator, Info, FileText } from 'lucide-react';

interface NavLinksProps {
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
  onActionComplete?: () => void;
}

const NavLinks = ({ isMobile = false, onClick, className, onActionComplete }: NavLinksProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400";
  };

  // Common classes for mobile and desktop links
  const linkBaseClasses = 'font-medium transition-colors duration-300 flex items-center gap-1';
  
  // Desktop-specific classes
  const desktopLinkClasses = `${linkBaseClasses} hover:scale-105 transform relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-700 dark:after:bg-purple-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left`;
  
  // Mobile-specific classes
  const mobileLinkClasses = `${linkBaseClasses} px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 w-full text-left`;
  
  const linkClasses = isMobile ? mobileLinkClasses : desktopLinkClasses;

  const handleClick = () => {
    if (onClick) onClick();
    if (onActionComplete) onActionComplete();
  };

  const containerClass = isMobile 
    ? `flex flex-col gap-4 ${className || ""}` 
    : `flex items-center gap-8 ${className || ""}`;

  return (
    <div className={containerClass}>
      <Link 
        to="/" 
        className={`${isActive('/')} ${linkClasses}`}
        onClick={handleClick}
      >
        <Home size={18} />
        <span>Home</span>
      </Link>
      <Link 
        to="/properties" 
        className={`${isActive('/properties')} ${linkClasses}`}
        onClick={handleClick}
      >
        <Building size={18} />
        <span>Properties</span>
      </Link>
      <Link 
        to="/loans" 
        className={`${isActive('/loans')} ${linkClasses}`}
        onClick={handleClick}
      >
        <Building size={18} />
        <span>Loans</span>
      </Link>
      <Link 
        to="/calculator" 
        className={`${isActive('/calculator')} ${linkClasses}`}
        onClick={handleClick}
      >
        <Calculator size={18} />
        <span>Calculator</span>
      </Link>
      <Link 
        to="/about" 
        className={`${isActive('/about')} ${linkClasses}`}
        onClick={handleClick}
      >
        <Info size={18} />
        <span>About Us</span>
      </Link>
    </div>
  );
};

export default NavLinks;
