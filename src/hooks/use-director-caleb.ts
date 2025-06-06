
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
        // Use the new security function to check Director Caleb status
        const { data, error } = await supabase.rpc('is_director_caleb', {
          user_id: user.id
        });

        if (error) {
          console.error('Error checking Director Caleb status:', error);
          setIsDirectorCaleb(false);
        } else {
          setIsDirectorCaleb(data || false);
        }
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
