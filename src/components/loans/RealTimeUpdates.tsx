
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RealTimeUpdatesProps {
  onLoanUpdate?: (data: any) => void;
  onClientUpdate?: (data: any) => void;
  onBranchUpdate?: (data: any) => void;
}

const RealTimeUpdates = ({
  onLoanUpdate,
  onClientUpdate,
  onBranchUpdate,
}: RealTimeUpdatesProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to loan applications changes
    const loanChannel = supabase
      .channel('public:loan_applications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_applications' },
        (payload) => {
          console.log('Loan application change:', payload);
          if (onLoanUpdate) onLoanUpdate(payload);

          // Show toast notification for status changes
          if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old.status) {
            toast({
              title: 'Loan Application Updated',
              description: `Status changed from ${payload.old.status} to ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to clients changes if needed
    const clientsChannel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('Client change:', payload);
          if (onClientUpdate) onClientUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to branches changes
    const branchesChannel = supabase
      .channel('public:branches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'branches' },
        (payload) => {
          console.log('Branch change:', payload);
          if (onBranchUpdate) onBranchUpdate(payload);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(loanChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(branchesChannel);
    };
  }, [user, onLoanUpdate, onClientUpdate, onBranchUpdate, toast]);

  // This is a utility component, so it doesn't render anything
  return null;
};

export default RealTimeUpdates;
