
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialAdjustment {
  id: string;
  adjustment_type: 'income_adjustment' | 'expense_adjustment' | 'portfolio_adjustment' | 'collection_rate_override';
  original_value: number;
  adjusted_value: number;
  reason: string;
  effective_date: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'reverted';
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

interface CreateAdjustmentData {
  adjustment_type: FinancialAdjustment['adjustment_type'];
  original_value: number;
  adjusted_value: number;
  reason: string;
  effective_date?: string;
  expires_at?: string;
}

export const useFinancialAdjustments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all adjustments
  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ['financial-adjustments'],
    queryFn: async () => {
      console.log('Fetching financial adjustments...');
      
      const { data, error } = await supabase
        .from('financial_adjustments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching financial adjustments:', error);
        throw error;
      }
      
      return data as FinancialAdjustment[];
    },
  });

  // Create new adjustment
  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: CreateAdjustmentData) => {
      const { data: result, error } = await supabase
        .from('financial_adjustments')
        .insert({
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          effective_date: data.effective_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-financial-sync'] });
      toast({
        title: 'Success',
        description: 'Financial adjustment created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create financial adjustment',
        variant: 'destructive',
      });
    },
  });

  return {
    adjustments,
    isLoading,
    createAdjustment: createAdjustmentMutation.mutate,
    isCreating: createAdjustmentMutation.isPending,
  };
};
