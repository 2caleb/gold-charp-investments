
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type NavLinksProps = {
  type?: 'mobile' | 'desktop';
  className?: string;
  onItemClick?: () => void; // For mobile menu to close after clicking
  isMobile?: boolean; // Added this prop to fix the type error
};

export const links = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Properties', href: '/properties' },
  { name: 'Loans', href: '/loans' },
  { name: 'Services', href: '/services' },
  { name: 'Property Evaluation', href: '/property-evaluation' },
  { name: 'Calculator', href: '/calculator' },
  { name: 'Contact', href: '/contact' },
];

const NavLinks = ({ type = 'desktop', className = '', onItemClick, isMobile }: NavLinksProps) => {
  if (type === 'mobile' || isMobile === true) {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {links.map((link) => (
          <Link 
            key={link.name}
            to={link.href}
            className="text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onItemClick}
          >
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
          className="text-sm font-medium transition-colors hover:text-primary px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
