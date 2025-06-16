
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExpenseWeeklySummary {
  id: string;
  week_start_date: string;
  week_end_date: string;
  year: number;
  week_number: number;
  category: string;
  account: string;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  min_amount: number;
  max_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseMonthlySummary {
  id: string;
  month: number;
  year: number;
  month_start_date: string;
  month_end_date: string;
  category: string;
  account: string;
  total_amount: number;
  weekly_summaries_count: number;
  average_weekly_amount: number;
  variance_from_previous_month: number;
  growth_percentage: number;
  budget_amount: number;
  budget_variance: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSmartCalculation {
  id: string;
  calculation_type: string;
  month: number;
  year: number;
  category?: string;
  account?: string;
  calculation_data: Record<string, any>;
  insights: string[];
  recommendations: string[];
  confidence_score: number;
  created_at: string;
}

export const useExpenseWeeklySummaries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['expense-weekly-summaries'],
    queryFn: async (): Promise<ExpenseWeeklySummary[]> => {
      const { data, error } = await supabase
        .from('expense_weekly_summaries')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('expense-weekly-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'expense_weekly_summaries'
        },
        () => {
          queryClient.invalidateQueries({ 
            queryKey: ['expense-weekly-summaries'] 
          });
          toast({
            title: 'Expense Data Updated',
            description: 'Weekly expense summaries have been updated',
            duration: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  return { data, isLoading, error };
};

export const useExpenseMonthlySummaries = (targetMonth?: number, targetYear?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['expense-monthly-summaries', targetMonth, targetYear],
    queryFn: async (): Promise<ExpenseMonthlySummary[]> => {
      let query = supabase
        .from('expense_monthly_summaries')
        .select('*');

      if (targetMonth && targetYear) {
        query = query
          .eq('month', targetMonth)
          .eq('year', targetYear);
      }

      const { data, error } = await query
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('expense-monthly-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'expense_monthly_summaries'
        },
        () => {
          queryClient.invalidateQueries({ 
            queryKey: ['expense-monthly-summaries'] 
          });
          toast({
            title: 'Monthly Analysis Updated',
            description: 'Monthly expense summaries have been updated',
            duration: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  return { data, isLoading, error };
};

export const useExpenseSmartCalculations = (targetMonth?: number, targetYear?: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expense-smart-calculations', targetMonth, targetYear],
    queryFn: async (): Promise<ExpenseSmartCalculation[]> => {
      let query = supabase
        .from('expense_smart_calculations')
        .select('*');

      if (targetMonth && targetYear) {
        query = query
          .eq('month', targetMonth)
          .eq('year', targetYear);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(calc => ({
        ...calc,
        calculation_data: typeof calc.calculation_data === 'string' 
          ? JSON.parse(calc.calculation_data) 
          : (calc.calculation_data || {})
      }));
    },
    refetchInterval: 30000,
  });

  return { data, isLoading, error };
};

// Helper function to trigger manual clustering
export const triggerExpenseClustering = async (targetDate?: string) => {
  try {
    const { error: weeklyError } = await supabase.rpc('cluster_expenses_weekly', {
      target_week_start: targetDate || null
    });
    
    if (weeklyError) throw weeklyError;

    const { error: monthlyError } = await supabase.rpc('cluster_expenses_monthly');
    
    if (monthlyError) throw monthlyError;

    const { error: analysisError } = await supabase.rpc('smart_end_of_month_analysis');
    
    if (analysisError) throw analysisError;

    return { success: true };
  } catch (error) {
    console.error('Error triggering expense clustering:', error);
    throw error;
  }
};
