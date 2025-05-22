
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, FileText, Calculator, Landmark, FileCheck, Phone, UserRound } from 'lucide-react';

type NavLinksProps = {
  type?: 'mobile' | 'desktop';
  className?: string;
  onItemClick?: () => void; // For mobile menu to close after clicking
  isMobile?: boolean; // Added this prop to fix the type error
};

// Updated links with icons
export const links = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: Landmark },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Loan Applications', href: '/loan-applications', icon: FileText },
  { name: 'Property Evaluation', href: '/property-evaluation', icon: FileCheck },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Contact', href: '/contact', icon: Phone },
];

const NavLinks = ({ type = 'desktop', className = '', onItemClick, isMobile }: NavLinksProps) => {
  if (type === 'mobile' || isMobile === true) {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {links.map((link) => (
          <Link 
            key={link.name}
            to={link.href}
            className="text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
            onClick={onItemClick}
          >
            {link.icon && <link.icon className="mr-2 h-5 w-5" />}
            {link.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1 md:gap-2', className)}>
      {links.map((link) => (
        <Link 
          key={link.name}
          to={link.href}
          className="text-sm font-medium transition-colors hover:text-primary px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
        >
          {link.icon && <link.icon className="mr-1 h-4 w-4" />}
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
