
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
  BarChartHorizontal,
  LineChart,
  ClipboardCheck,
  Building2,
  Stamp
} from 'lucide-react';
import { useRolePermissions } from '@/hooks/use-role-permissions';

type NavLinksProps = {
  type?: 'mobile' | 'desktop';
  className?: string;
  onItemClick?: () => void; // For mobile menu to close after clicking
  isMobile?: boolean; // Added this prop to fix the type error
};

const NavLinks = ({ type = 'desktop', className = '', onItemClick, isMobile }: NavLinksProps) => {
  const { isFieldOfficer, isManager, isDirector, isCEO, isChairperson } = useRolePermissions();

  // Base links for all users
  const baseLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: Landmark },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Loan Applications', href: '/loan-applications', icon: FileText },
    { name: 'Property Evaluation', href: '/property-evaluation', icon: FileCheck },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];
  
  // Role-specific links
  const roleLinks = [];
  
  if (isFieldOfficer) {
    roleLinks.push(
      { name: 'Data Collection', href: '/staff/data-collection', icon: ClipboardCheck }
    );
  }
  
  if (isManager) {
    roleLinks.push(
      { name: 'Manager Review', href: '/staff/manager-review', icon: LineChart }
    );
  }
  
  if (isDirector) {
    roleLinks.push(
      { name: 'Risk Assessment', href: '/staff/director-risk-dashboard', icon: BarChartHorizontal }
    );
  }
  
  if (isChairperson) {
    roleLinks.push(
      { name: 'Chairperson Review', href: '/staff/chairperson-final-dashboard', icon: Building2 }
    );
  }
  
  if (isCEO) {
    roleLinks.push(
      { name: 'CEO Approval', href: '/staff/ceo-approval-dashboard', icon: Stamp }
    );
  }
  
  // Combine base links with role-specific links
  const links = [...baseLinks, ...roleLinks];

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
    <div className={cn('flex gap-1 md:gap-2 flex-wrap', className)}>
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
