
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface SharedExcelRow {
  id: string;
  upload_id: string;
  sheet_name: string;
  row_data: Record<string, any>;
  row_index: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadHistory {
  id: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  sheet_count: number;
  total_rows: number;
  status: string;
  uploaded_by: string;
  storage_path: string;
  processing_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useSharedExcelData = () => {
  const { data: excelData, isLoading: excelLoading, refetch: refetchExcel } = useQuery({
    queryKey: ['shared-excel-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_excel_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SharedExcelRow[];
    },
  });

  const { data: uploadHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['upload-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upload_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UploadHistory[];
    },
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const excelChannel = supabase
      .channel('shared_excel_data_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shared_excel_data' }, 
        () => {
          refetchExcel();
        }
      )
      .subscribe();

    const historyChannel = supabase
      .channel('upload_history_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'upload_history' }, 
        () => {
          refetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(excelChannel);
      supabase.removeChannel(historyChannel);
    };
  }, [refetchExcel, refetchHistory]);

  // Group data by upload for better organization
  const groupedData = excelData?.reduce((acc, row) => {
    if (!acc[row.upload_id]) {
      acc[row.upload_id] = [];
    }
    acc[row.upload_id].push(row);
    return acc;
  }, {} as Record<string, SharedExcelRow[]>) || {};

  return {
    excelData,
    uploadHistory,
    groupedData,
    isLoading: excelLoading || historyLoading,
    refetchExcel,
    refetchHistory
  };
};
