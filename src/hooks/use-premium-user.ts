
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PremiumUserProfile {
  full_name: string | null;
  role: string | null;
  email: string | null;
  initials: string;
  roleDisplayName: string;
}

export const usePremiumUser = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PremiumUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, email')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        const fullName = data?.full_name || user.email?.split('@')[0] || 'User';
        const role = data?.role || 'user';
        const email = data?.email || user.email || '';

        const initials = fullName
          .split(' ')
          .map(name => name.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2);

        const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');

        setProfile({
          full_name: fullName,
          role,
          email,
          initials,
          roleDisplayName
        });
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, user?.email]);

  return { profile, isLoading };
};
