
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  FileText, 
  Calculator, 
  Landmark, 
  FileCheck, 
  Phone, 
  UserRound,
  ClipboardCheck,
  Building2,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useRolePermissions } from '@/hooks/use-role-permissions';

type NavLinksProps = {
  type?: 'mobile' | 'desktop';
  className?: string;
  onItemClick?: () => void;
  isMobile?: boolean;
};

const NavLinks = ({ type = 'desktop', className = '', onItemClick, isMobile }: NavLinksProps) => {
  const { isFieldOfficer } = useRolePermissions();

  // Base links for all users
  const baseLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: Landmark },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Loan Applications', href: '/loan-applications', icon: FileText },
    { name: 'Property Evaluation', href: '/property-evaluation', icon: Building2 },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];
  
  // Role-specific links - simplified to only essential staff tools
  const roleLinks = [];
  
  if (isFieldOfficer) {
    roleLinks.push(
      { name: 'Data Collection', href: '/staff/data-collection', icon: ClipboardCheck }
    );
  }

  // Combine base links with role-specific links
  const links = [...baseLinks, ...roleLinks];

  if (type === 'mobile' || isMobile === true) {
    return (
      <div className={cn('flex flex-col space-y-3', className)}>
        {links.map((link) => (
          <Link 
            key={link.name}
            to={link.href}
            className="text-base font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
            onClick={onItemClick}
          >
            {link.icon && <link.icon className="mr-3 h-4 w-4" />}
            {link.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1 md:gap-2 flex-wrap', className)}>
      {links.map((link) => (
        <Link 
          key={link.name}
          to={link.href}
          className="text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
        >
          {link.icon && <link.icon className="mr-2 h-4 w-4" />}
          <span className="truncate">{link.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
