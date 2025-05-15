
import { useAuth } from '@/contexts/AuthContext';

export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};
