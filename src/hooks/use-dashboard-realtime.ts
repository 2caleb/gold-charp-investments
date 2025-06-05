
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardRealtime = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for loan applications');

    const channel = supabase
      .channel('loan-applications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loan_applications'
      }, (payload) => {
        console.log('Real-time update received:', payload);
        
        // Invalidate and refetch the applications data
        queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
        
        // Show notification for new applications
        if (payload.eventType === 'INSERT') {
          toast({
            title: 'New Application Submitted',
            description: `New loan application from ${payload.new.client_name}`,
          });
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loan_applications_workflow'
      }, (payload) => {
        console.log('Workflow update received:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);
};
