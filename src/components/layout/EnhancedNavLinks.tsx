
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
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
  Upload,
  Clock,
  Sparkles
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  roles?: string[];
}

interface UserProfile {
  full_name: string | null;
  role: string | null;
}

const mainNavItems: NavItem[] = [
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }));

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error in fetchProfile:', error);
        }
      }
    };

    if (user?.id) {
      setTimeout(() => {
        fetchProfile();
      }, 0);
    }
  }, [user?.id]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'ceo': return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'director': return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'manager': return 'bg-gradient-to-r from-emerald-600 to-green-600';
      case 'chairperson': return 'bg-gradient-to-r from-amber-600 to-orange-600';
      case 'field_officer': return 'bg-gradient-to-r from-teal-600 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-600 to-slate-600';
    }
  };

  const getRoleIcon = (role: string) => {
    if (['ceo', 'director', 'chairperson'].includes(role?.toLowerCase())) {
      return <Crown className="h-4 w-4" />;
    }
    return <Sparkles className="h-4 w-4" />;
  };

  const formatRole = (role: string | null) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  };

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

  const PremiumWelcomeHeader = () => {
    const fullName = profile?.full_name || user?.email?.split('@')[0] || 'User';
    const role = profile?.role || 'user';
    const initials = fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-100/50",
          isMobile ? "mx-2" : "mx-4"
        )}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${getRoleColor(role)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
            {initials}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {getGreeting()}, {fullName}!
            </h2>
            
            <div className="flex items-center space-x-2 mt-1">
              <div className={`${getRoleColor(role)} text-white border-none px-2 py-1 rounded-md flex items-center space-x-1 text-xs font-medium`}>
                {getRoleIcon(role)}
                <span>{formatRole(role)}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                {currentTime}
              </div>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-gray-700">Gold Charp Investments</p>
            <p className="text-xs text-gray-500">Premium Financial Dashboard</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-1">
      <PremiumWelcomeHeader />
      
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
