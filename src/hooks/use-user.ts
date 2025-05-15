
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  phone: string | null;
};

export const useUser = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, phone')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Exception fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && !isAuthLoading) {
      // Use setTimeout to avoid Supabase auth deadlock
      setTimeout(() => {
        fetchUserProfile();
      }, 0);
    } else {
      setIsLoading(isAuthLoading);
    }
  }, [user?.id, isAuthLoading]);

  return { user, userProfile, isLoading };
};
