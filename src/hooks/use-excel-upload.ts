
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export interface ExcelUploadProgress {
  uploading: boolean;
  processing: boolean;
  progress: number;
  stage: string;
}

export const useExcelUpload = () => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<ExcelUploadProgress>({
    uploading: false,
    processing: false,
    progress: 0,
    stage: ''
  });

  const uploadExcelFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setUploadProgress({
        uploading: true,
        processing: false,
        progress: 10,
        stage: 'Uploading file...'
      });

      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `uploads/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('excel-uploads')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(prev => ({
        ...prev,
        progress: 30,
        stage: 'Processing Excel data...',
        processing: true
      }));

      // Read and process Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let totalRows = 0;
      const uploadId = crypto.randomUUID();

      // Create upload history record
      const { data: historyData, error: historyError } = await supabase
        .from('upload_history')
        .insert({
          id: uploadId,
          file_name: fileName,
          original_file_name: file.name,
          file_size: file.size,
          sheet_count: workbook.SheetNames.length,
          uploaded_by: user.id,
          storage_path: storagePath,
          status: 'processing'
        })
        .select()
        .single();

      if (historyError) throw historyError;

      setUploadProgress(prev => ({
        ...prev,
        progress: 50,
        stage: 'Processing sheets...'
      }));

      // Process each sheet
      for (let i = 0; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip empty sheets
        if (jsonData.length === 0) continue;

        // Get headers from first row
        const headers = jsonData[0] as string[];
        
        // Process data rows
        const dataRows = jsonData.slice(1).map((row: any[], index) => {
          const rowObject: Record<string, any> = {};
          headers.forEach((header, colIndex) => {
            rowObject[header || `Column_${colIndex + 1}`] = row[colIndex] || null;
          });
          return {
            upload_id: uploadId,
            sheet_name: sheetName,
            row_data: rowObject,
            row_index: index + 1,
            uploaded_by: user.id
          };
        });

        totalRows += dataRows.length;

        // Insert data in batches
        const batchSize = 100;
        for (let j = 0; j < dataRows.length; j += batchSize) {
          const batch = dataRows.slice(j, j + batchSize);
          const { error: insertError } = await supabase
            .from('shared_excel_data')
            .insert(batch);

          if (insertError) throw insertError;

          const progress = 50 + ((j + batchSize) / dataRows.length) * 40;
          setUploadProgress(prev => ({
            ...prev,
            progress,
            stage: `Processing ${sheetName} (${j + batchSize}/${dataRows.length} rows)...`
          }));
        }
      }

      // Update upload history with completion
      await supabase
        .from('upload_history')
        .update({
          total_rows: totalRows,
          status: 'completed',
          processing_notes: `Successfully processed ${totalRows} rows across ${workbook.SheetNames.length} sheets`
        })
        .eq('id', uploadId);

      setUploadProgress({
        uploading: false,
        processing: false,
        progress: 100,
        stage: 'Complete!'
      });

      toast({
        title: "Excel Upload Successful",
        description: `Processed ${totalRows} rows from ${workbook.SheetNames.length} sheets.`
      });

      return uploadId;

    } catch (error: any) {
      console.error('Excel upload error:', error);
      setUploadProgress({
        uploading: false,
        processing: false,
        progress: 0,
        stage: ''
      });

      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process Excel file.",
        variant: "destructive"
      });

      return null;
    }
  };

  return {
    uploadExcelFile,
    uploadProgress
  };
};
