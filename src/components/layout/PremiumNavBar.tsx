import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  Bell,
  Home,
  Building2,
  Calculator,
  FileText,
  Phone,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  full_name: string | null;
  role: string | null;
}

const PremiumNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect for blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error('Error in profile fetch:', error);
        }
      }
    };

    if (user?.id) {
      setTimeout(() => {
        fetchUserProfile();
      }, 0);
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const quickLinks = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Loan Calculator', href: '/calculator', icon: Calculator },
    { name: 'Loan Options', href: '/loans', icon: FileText },
    { name: 'About Us', href: '/about', icon: Info },
  ];

  const formatRole = (role: string | null) => {
    if (!role) return 'Client';
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-white shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-lg">GC</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  Gold Charp
                </div>
                <div className="text-xs text-gray-500 -mt-1">Investments</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Quick Links Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors duration-200"
                >
                  Quick Links
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
                <DropdownMenuLabel className="text-gray-900 font-semibold">Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link 
                      to={link.href}
                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Contact Us */}
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Contact Us
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-semibold text-gray-900">
                          {userProfile?.full_name || 'User'}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          {formatRole(userProfile?.role)}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl" align="end">
                    <DropdownMenuLabel className="text-gray-900">
                      <div className="font-semibold">{userProfile?.full_name || 'User'}</div>
                      <div className="text-xs text-blue-600 font-normal">{formatRole(userProfile?.role)}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50/50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-md border-l border-white/20">
                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Mobile Logo */}
                    <div className="flex items-center space-x-3 px-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">GC</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">Gold Charp</div>
                        <div className="text-xs text-gray-500">Investments</div>
                      </div>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="space-y-2 px-4">
                      {quickLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.href}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <link.icon className="h-5 w-5" />
                          {link.name}
                        </Link>
                      ))}
                      <Link
                        to="/contact"
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Phone className="h-5 w-5" />
                        Contact Us
                      </Link>
                    </div>

                    {/* Mobile User Section */}
                    <div className="border-t border-gray-200 pt-6 px-4">
                      {user ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {userProfile?.full_name || 'User'}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {formatRole(userProfile?.role)}
                              </div>
                            </div>
                          </div>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="h-5 w-5" />
                            Dashboard
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <Settings className="h-5 w-5" />
                            Profile Settings
                          </Link>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              handleSignOut();
                              setIsOpen(false);
                            }}
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/50 px-3 py-3"
                          >
                            <LogOut className="h-5 w-5 mr-3" />
                            Sign Out
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate('/login');
                              setIsOpen(false);
                            }}
                            className="w-full justify-start px-3 py-3"
                          >
                            Sign In
                          </Button>
                          <Button
                            onClick={() => {
                              navigate('/register');
                              setIsOpen(false);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg shadow-lg"
                          >
                            Register
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PremiumNavBar;
