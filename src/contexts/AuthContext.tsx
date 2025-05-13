
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('goldcharp_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('goldcharp_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For demo purposes, we're simulating an API call
      // In a real application, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate validation (in real app, this would be done server-side)
      if (email.trim() === '' || password.trim() === '') {
        throw new Error('Email and password are required');
      }

      // Mock successful login with a fake user
      const mockUser: User = {
        id: '1',
        fullName: email.split('@')[0],
        email,
        role: 'user',
      };

      // Store user in local storage and state
      localStorage.setItem('goldcharp_user', JSON.stringify(mockUser));
      setUser(mockUser);

      // Show success toast
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${mockUser.fullName}!`,
      });

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // For demo purposes, we're simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate validation
      if (!userData.email || !userData.password || !userData.fullName) {
        throw new Error('Please fill in all required fields');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Mock successful registration
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        fullName: userData.fullName,
        email: userData.email,
        role: 'user',
      };

      // Store user in local storage and state
      localStorage.setItem('goldcharp_user', JSON.stringify(mockUser));
      setUser(mockUser);

      // Show success toast
      toast({
        title: 'Registration Successful',
        description: `Welcome to Gold Charp Investments, ${userData.fullName}!`,
      });

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('goldcharp_user');
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
