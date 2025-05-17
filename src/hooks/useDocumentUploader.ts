
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentType, BucketType, documentToBucketMap, UploadedDocument } from '@/types/document';

export function useDocumentUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    loanApplicationId?: string,
    description?: string,
    tags?: string[]
  ): Promise<UploadedDocument | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to upload documents',
        variant: 'destructive',
      });
      return null;
    }

    const bucketId = documentToBucketMap[documentType];
    if (!bucketId) {
      toast({
        title: 'Error',
        description: 'Invalid document type',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${documentType}/${fileName}`;

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      if (!data) throw new Error('Upload failed');

      console.log('File uploaded successfully to bucket:', bucketId, data);

      // Save metadata to database
      const { data: metaData, error: metaError } = await supabase
        .from('document_metadata')
        .insert({
          user_id: user.id,
          loan_application_id: loanApplicationId,
          document_type: documentType,
          storage_path: data.path,
          file_name: file.name,
          content_type: file.type,
          file_size: file.size,
          description,
          tags,
        })
        .select()
        .single();

      if (metaError) throw metaError;

      const newDocument: UploadedDocument = {
        id: metaData.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType: documentType,
        description,
        tags,
      };

      toast({
        title: 'Upload successful',
        description: `${file.name} was uploaded successfully to ${bucketId}`,
      });

      return newDocument;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload failed',
        description: error?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadDocument
  };
}
