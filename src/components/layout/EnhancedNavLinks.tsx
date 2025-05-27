
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
  TrendingUp,
  Settings
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview & Analytics'
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
    description: 'Client Management'
  },
  {
    title: 'Loan Applications',
    href: '/loan-applications',
    icon: FileText,
    description: 'Application Processing'
  },
  {
    title: 'New Application',
    href: '/new-loan-application',
    icon: ClipboardList,
    description: 'Submit New Loan'
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
    title: 'Calculator',
    href: '/calculator',
    icon: Calculator,
    description: 'Loan Calculator'
  },
  {
    title: 'Properties',
    href: '/properties',
    icon: Building,
    description: 'Property Valuation'
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: Shield,
    description: 'Document Management'
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'System Alerts'
  }
];

const staffNavItems = [
  {
    title: 'Data Collection',
    href: '/staff/data-collection',
    icon: UserCheck,
    description: 'Field Data Entry'
  },
  {
    title: 'Collection Dashboard',
    href: '/staff/data-collection-dashboard',
    icon: ClipboardList,
    description: 'Collection Overview'
  },
  {
    title: 'Manager Review',
    href: '/staff/manager-review',
    icon: Shield,
    description: 'Manager Approval'
  },
  {
    title: 'Director Risk',
    href: '/staff/director-risk',
    icon: TrendingUp,
    description: 'Risk Assessment'
  },
  {
    title: 'CEO Approval',
    href: '/staff/ceo-approval',
    icon: Settings,
    description: 'Executive Review'
  },
  {
    title: 'Final Approval',
    href: '/staff/chairperson-approval',
    icon: Shield,
    description: 'Chairperson Review'
  }
];

interface EnhancedNavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const EnhancedNavLinks: React.FC<EnhancedNavLinksProps> = ({ isMobile = false, onLinkClick }) => {
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavLinkItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = isActivePath(item.href);
    const Icon = item.icon;

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

  return (
    <div className="space-y-1">
      {/* Main Navigation */}
      <div className={cn(
        "space-y-1",
        !isMobile && "px-2"
      )}>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLinkItem key={item.href} item={item} />
        ))}
      </div>

      {/* Staff Navigation */}
      <div className={cn(
        "space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700",
        !isMobile && "px-2"
      )}>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
          Staff Tools
        </div>
        {staffNavItems.map((item) => (
          <NavLinkItem key={item.href} item={item} />
        ))}
      </div>

      {/* Quick Actions for Mobile */}
      {isMobile && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
            Quick Actions
          </div>
          <Link
            to="/new-client"
            onClick={onLinkClick}
            className="group flex items-center px-3 py-2 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Users className="mr-3 h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-medium">Add New Client</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Register new client
              </span>
            </div>
          </Link>
          <Link
            to="/new-loan-application"
            onClick={onLinkClick}
            className="group flex items-center px-3 py-2 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <FileText className="mr-3 h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-medium">New Loan Application</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Submit loan request
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EnhancedNavLinks;
