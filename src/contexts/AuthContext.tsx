
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthSession, AuthUser } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  // Add aliases for backward compatibility
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {email: string, password: string, fullName?: string, phone?: string}) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          const userName = currentSession?.user?.user_metadata?.full_name || 'User';
          toast({
            title: 'Welcome',
            description: `You're now signed in as ${userName}`,
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Toast notification is handled by onAuthStateChange
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

  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Please fill in all required fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.fullName || '',
            phone: metadata?.phone || null,
            role: metadata?.role || 'user', // Default role is 'user'
          },
        },
      });

      if (error) {
        throw error;
      }

      // Show success toast
      toast({
        title: 'Registration Successful',
        description: `Welcome to Gold Charp Investments, ${metadata?.fullName}!`,
      });
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Add alias methods for backward compatibility
  const login = signIn;
  const register = (userData: {email: string, password: string, fullName?: string, phone?: string}) => {
    return signUp(userData.email, userData.password, {
      fullName: userData.fullName,
      phone: userData.phone
    });
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user, // Add this computed property
    signIn,
    signUp,
    signOut,
    // Add aliases
    login,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
