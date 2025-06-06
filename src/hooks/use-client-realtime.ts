
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClientRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up real-time subscriptions for client data...');

    // Subscribe to client_name changes
    const clientChannel = supabase
      .channel('client_data_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_name' },
        (payload) => {
          console.log('Client data updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['enhanced-clients-data'] });
          queryClient.invalidateQueries({ queryKey: ['clients-data'] });
        }
      )
      .subscribe();

    // Subscribe to loan_applications changes
    const applicationChannel = supabase
      .channel('loan_application_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_applications' },
        (payload) => {
          console.log('Loan application updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['enhanced-clients-data'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-applications'] });
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Application Status Updated",
              description: "A loan application status has been updated",
              variant: "default"
            });
          }
        }
      )
      .subscribe();

    // Subscribe to workflow changes
    const workflowChannel = supabase
      .channel('workflow_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_applications_workflow' },
        (payload) => {
          console.log('Workflow updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['enhanced-clients-data'] });
          queryClient.invalidateQueries({ queryKey: ['loan-workflow'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up client real-time subscriptions');
      supabase.removeChannel(clientChannel);
      supabase.removeChannel(applicationChannel);
      supabase.removeChannel(workflowChannel);
    };
  }, [queryClient, toast]);
};
