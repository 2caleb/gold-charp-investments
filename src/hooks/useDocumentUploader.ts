
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { DocumentType, BucketType, documentToBucketMap } from '@/types/document';

export type UploadResult = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: DocumentType;
  description?: string;
  tags?: string[];
};

export const useDocumentUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    loanApplicationId?: string | null,
    description?: string,
    tags?: string[]
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    setIsUploading(true);
    try {
      // Generate a unique ID for the document
      const documentId = uuidv4();
      const bucketName = documentToBucketMap[documentType];
      const filePath = `documents/${documentId}`;
      
      // Upload file to Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading document:', uploadError);
        toast({
          title: 'Upload Failed',
          description: `Could not upload ${file.name}: ${uploadError.message}`,
          variant: 'destructive',
        });
        return null;
      }

      // Store document metadata in the database
      const { data: metadataData, error: metadataError } = await supabase
        .from('document_metadata')
        .insert({
          id: documentId,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          storage_path: filePath,
          document_type: documentType,
          loan_application_id: loanApplicationId || null,
          description: description || null,
          tags: tags || null
        })
        .select('id')
        .single();

      if (metadataError) {
        console.error('Error storing document metadata:', metadataError);
        // Try to delete the uploaded file if metadata storage failed
        await supabase.storage.from(bucketName).remove([filePath]);
        
        toast({
          title: 'Upload Failed',
          description: `Could not store metadata for ${file.name}`,
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Document Uploaded',
        description: `${file.name} has been uploaded successfully`,
      });

      return {
        id: documentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType,
        description,
        tags
      };
    } catch (error: any) {
      console.error('Error in document upload:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading
  };
};
