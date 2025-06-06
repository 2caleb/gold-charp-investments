
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { 
  Home, 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Bell, 
  Calculator,
  Building,
  Shield,
  UserCheck,
  ClipboardList,
  Settings,
  Crown,
  Upload
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  roles?: string[];
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview & Analytics'
  },
  {
    title: 'Loan Applications',
    href: '/loan-applications',
    icon: FileText,
    description: 'View All Applications',
    roles: ['field_officer', 'manager', 'director', 'ceo', 'chairperson']
  },
  {
    title: 'New Application',
    href: '/loan-applications/new',
    icon: ClipboardList,
    description: 'Submit New Loan',
    roles: ['field_officer', 'manager', 'director', 'ceo', 'chairperson']
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
    description: 'Client Management'
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: DollarSign,
    description: 'Payment Tracking'
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Financial Reports'
  },
  {
    title: 'Premium Dashboard',
    href: '/premium-dashboard',
    icon: Crown,
    description: 'Advanced Management',
    roles: ['manager', 'director', 'ceo', 'chairperson']
  }
];

const staffNavItems: NavItem[] = [
  {
    title: 'Data Collection',
    href: '/staff/data-collection',
    icon: UserCheck,
    description: 'Field Data Entry',
    roles: ['field_officer', 'manager', 'director', 'ceo', 'chairperson']
  }
];

const quickActions: NavItem[] = [
  {
    title: 'Add New Client',
    href: '/new-client',
    icon: Users,
    description: 'Register new client'
  },
  {
    title: 'New Loan Application',
    href: '/new-loan-application',
    icon: FileText,
    description: 'Submit loan request'
  }
];

interface EnhancedNavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const EnhancedNavLinks: React.FC<EnhancedNavLinksProps> = ({ isMobile = false, onLinkClick }) => {
  const location = useLocation();
  const { userRole } = useRolePermissions();

  const isActivePath = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasRoleAccess = (item: NavItem) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  };

  const NavLinkItem = ({ item }: { item: NavItem }) => {
    const isActive = isActivePath(item.href);
    const Icon = item.icon;

    if (!hasRoleAccess(item)) return null;

    return (
      <Link
        to={item.href}
        onClick={onLinkClick}
        className={cn(
          "group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
          "hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20",
          isMobile ? "w-full justify-start" : "relative",
          isActive
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            : "text-gray-600 dark:text-gray-300"
        )}
      >
        <Icon className={cn(
          "flex-shrink-0 h-5 w-5 transition-colors",
          isMobile ? "mr-3" : "mr-2",
          isActive ? "text-purple-600" : "text-gray-500 group-hover:text-purple-600"
        )} />
        
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          {isMobile && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {item.description}
            </span>
          )}
        </div>

        {!isMobile && isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-full" />
        )}
      </Link>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => {
    const visibleItems = items.filter(hasRoleAccess);
    
    if (visibleItems.length === 0) return null;

    return (
      <div className={cn("space-y-1", !isMobile && "px-2")}>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
          {title}
        </div>
        {visibleItems.map((item) => (
          <NavLinkItem key={item.href} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <NavSection title="Main Menu" items={mainNavItems} />
      
      {staffNavItems.some(hasRoleAccess) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <NavSection title="Staff Tools" items={staffNavItems} />
        </div>
      )}

      {isMobile && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <NavSection title="Quick Actions" items={quickActions} />
        </div>
      )}
    </div>
  );
};

export default EnhancedNavLinks;
