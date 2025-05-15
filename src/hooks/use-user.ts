
import { useAuth } from '@/contexts/AuthContext';

export const useUser = () => {
  const { user, isLoading } = useAuth();
  return { user, loading: isLoading };
};
