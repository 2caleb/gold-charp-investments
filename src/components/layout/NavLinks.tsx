
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinksProps {
  className?: string;
  onClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ className, onClick }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={cn("flex gap-8", className)}>
      <Link
        to="/"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        Home
      </Link>
      <Link
        to="/about"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/about') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        About
      </Link>
      <Link
        to="/properties"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/properties') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        Properties
      </Link>
      <Link
        to="/loans"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/loans') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        Loans
      </Link>
      <Link
        to="/money-transfer"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/money-transfer') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        Money Transfer
      </Link>
      <Link
        to="/services"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/services') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        Services
      </Link>
      <Link
        to="/contact"
        className={cn(
          "font-medium transition-colors hover:text-purple-700",
          isActive('/contact') ? "text-purple-700" : "text-gray-700"
        )}
        onClick={onClick}
      >
        Contact
      </Link>
    </nav>
  );
};

export default NavLinks;
