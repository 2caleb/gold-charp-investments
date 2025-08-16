import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EggDelivery, DeliveryFormData, DeliveryFilters, DeliveryStats } from '@/types/delivery';

export const useEggDeliveries = (filters?: DeliveryFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deliveries with optional filtering
  const { data: deliveries, isLoading, error, refetch } = useQuery({
    queryKey: ['egg-deliveries', filters],
    queryFn: async () => {
      let query = supabase
        .from('egg_deliveries')
        .select('*')
        .order('delivery_date', { ascending: false });

      // Apply filters
      if (filters?.supplier_name) {
        query = query.ilike('supplier_name', `%${filters.supplier_name}%`);
      }
      
      if (filters?.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }
      
      if (filters?.start_date) {
        query = query.gte('delivery_date', filters.start_date);
      }
      
      if (filters?.end_date) {
        query = query.lte('delivery_date', filters.end_date);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching deliveries:', error);
        throw error;
      }
      
      return data as EggDelivery[];
    },
  });

  // Calculate delivery statistics
  const deliveryStats: DeliveryStats | undefined = deliveries ? {
    total_deliveries: deliveries.length,
    total_trays: deliveries.reduce((sum, d) => sum + d.trays, 0),
    total_revenue: deliveries.filter(d => d.payment_status === 'paid').reduce((sum, d) => sum + d.total_amount, 0),
    paid_deliveries: deliveries.filter(d => d.payment_status === 'paid').length,
    pending_deliveries: deliveries.filter(d => d.payment_status === 'pending').length,
    overdue_deliveries: deliveries.filter(d => d.payment_status === 'overdue').length,
    unique_suppliers: new Set(deliveries.map(d => d.supplier_name)).size,
  } : undefined;

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (data: DeliveryFormData) => {
      // Calculate total_amount from trays and price_per_tray (will be overridden by trigger)
      const deliveryData = {
        ...data,
        total_amount: data.trays * data.price_per_tray,
      };
      
      const { data: result, error } = await supabase
        .from('egg_deliveries')
        .insert([deliveryData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['egg-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast({
        title: 'Success',
        description: 'Delivery record created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating delivery:', error);
      
      let errorMessage = 'Failed to create delivery record.';
      
      if (error?.message?.includes('row-level security')) {
        errorMessage = 'Access denied: Only Director Caleb can create delivery records.';
      } else if (error?.message?.includes('authentication')) {
        errorMessage = 'Authentication required to create delivery records.';
      } else if (error?.message) {
        errorMessage = `Database error: ${error.message}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Update delivery mutation
  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryFormData> }) => {
      const { data: result, error } = await supabase
        .from('egg_deliveries')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['egg-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast({
        title: 'Success',
        description: 'Delivery record updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating delivery:', error);
      toast({
        title: 'Error',
        description: 'Failed to update delivery record.',
        variant: 'destructive',
      });
    },
  });

  // Delete delivery mutation
  const deleteDeliveryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('egg_deliveries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['egg-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast({
        title: 'Success',
        description: 'Delivery record deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting delivery:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete delivery record.',
        variant: 'destructive',
      });
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('egg_deliveries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'egg_deliveries' }, () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, queryClient]);

  return {
    deliveries: deliveries || [],
    deliveryStats,
    isLoading,
    error,
    refetch,
    createDelivery: createDeliveryMutation.mutate,
    updateDelivery: updateDeliveryMutation.mutate,
    deleteDelivery: deleteDeliveryMutation.mutate,
    isCreating: createDeliveryMutation.isPending,
    isUpdating: updateDeliveryMutation.isPending,
    isDeleting: deleteDeliveryMutation.isPending,
  };
};