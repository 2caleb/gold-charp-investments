
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialManagementEntry {
  id: string;
  entry_type: 'manual_income' | 'manual_expense' | 'adjustment' | 'budget_target' | 'financial_goal';
  category: string;
  description: string;
  amount: number;
  target_amount?: number;
  period_start?: string;
  period_end?: string;
  status: 'active' | 'inactive' | 'completed';
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface CreateFinancialEntryData {
  entry_type: FinancialManagementEntry['entry_type'];
  category: string;
  description: string;
  amount: number;
  target_amount?: number;
  period_start?: string;
  period_end?: string;
}

export const useFinancialManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all financial management entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['financial-management'],
    queryFn: async () => {
      console.log('Fetching financial management entries...');
      
      const { data, error } = await supabase
        .from('financial_management')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching financial management entries:', error);
        throw error;
      }
      
      return data as FinancialManagementEntry[];
    },
  });

  // Create new financial entry
  const createEntryMutation = useMutation({
    mutationFn: async (data: CreateFinancialEntryData) => {
      const { data: result, error } = await supabase
        .from('financial_management')
        .insert({
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-management'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-financial-sync'] });
      toast({
        title: 'Success',
        description: 'Financial entry created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create financial entry',
        variant: 'destructive',
      });
    },
  });

  // Approve/reject entry
  const approveEntryMutation = useMutation({
    mutationFn: async ({ id, approved, reason }: { id: string; approved: boolean; reason?: string }) => {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('financial_management')
        .update({
          approval_status: approved ? 'approved' : 'rejected',
          approved_by: user.data.user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-management'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-financial-sync'] });
      toast({
        title: 'Success',
        description: 'Entry status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update entry status',
        variant: 'destructive',
      });
    },
  });

  return {
    entries,
    isLoading,
    createEntry: createEntryMutation.mutate,
    isCreating: createEntryMutation.isPending,
    approveEntry: approveEntryMutation.mutate,
    isApproving: approveEntryMutation.isPending,
  };
};
