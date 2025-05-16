
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type DocumentType = 
  'id_document' | 
  'collateral_photo' | 
  'property_document' | 
  'loan_agreement' | 
  'video_evidence' | 
  'passport_photo' | 
  'guarantor1_photo' | 
  'guarantor2_photo';

type BucketType = 'id_documents' | 'collateral_photos' | 'property_documents' | 'loan_documents' | 'user_photos' | 'guarantor_photos';

const documentToBucketMap: Record<DocumentType, BucketType> = {
  id_document: 'id_documents',
  collateral_photo: 'collateral_photos',
  property_document: 'property_documents',
  loan_agreement: 'loan_documents',
  video_evidence: 'loan_documents',
  passport_photo: 'user_photos',
  guarantor1_photo: 'guarantor_photos',
  guarantor2_photo: 'guarantor_photos'
};

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url?: string;
  documentType: DocumentType;
  description?: string;
  tags?: string[];
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
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

      setUploadedDocuments(prev => [...prev, newDocument]);

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

  const getDocumentUrl = async (documentId: string): Promise<string | null> => {
    try {
      // Get document metadata
      const { data: metaData, error: metaError } = await supabase
        .from('document_metadata')
        .select('storage_path, document_type')
        .eq('id', documentId)
        .single();

      if (metaError) throw metaError;
      if (!metaData) throw new Error('Document not found');

      const bucketId = documentToBucketMap[metaData.document_type as DocumentType];
      
      // Create signed URL
      const { data, error } = await supabase.storage
        .from(bucketId)
        .createSignedUrl(metaData.storage_path, 60); // 60 seconds expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error: any) {
      console.error('Error getting document URL:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Could not get document URL',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      // Get document metadata
      const { data: metaData, error: metaError } = await supabase
        .from('document_metadata')
        .select('storage_path, document_type')
        .eq('id', documentId)
        .single();

      if (metaError) throw metaError;
      if (!metaData) throw new Error('Document not found');

      const bucketId = documentToBucketMap[metaData.document_type as DocumentType];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove([metaData.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: deleteError } = await supabase
        .from('document_metadata')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: 'Document deleted',
        description: 'The document has been successfully deleted',
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Delete failed',
        description: error?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadedDocuments,
    uploadDocument,
    getDocumentUrl,
    deleteDocument,
    setUploadedDocuments
  };
}
