
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDirectorCaleb = () => {
  const { user } = useAuth();
  const [isDirectorCaleb, setIsDirectorCaleb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDirectorCaleb = async () => {
      if (!user) {
        setIsDirectorCaleb(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is Caleb by email and has director role
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking Director Caleb status:', error);
          setIsDirectorCaleb(false);
          setIsLoading(false);
          return;
        }

        // Check if user is Caleb Mwesigwa with director role
        const isCaleb = profileData?.email === 'calebmwesigwa@goldcharpinvestments.com' ||
                       user.email === 'calebmwesigwa@goldcharpinvestments.com';
        const isDirector = profileData?.role === 'director';

        setIsDirectorCaleb(isCaleb && isDirector);
      } catch (error) {
        console.error('Error in checkDirectorCaleb:', error);
        setIsDirectorCaleb(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDirectorCaleb();
  }, [user]);

  return { isDirectorCaleb, isLoading };
};
