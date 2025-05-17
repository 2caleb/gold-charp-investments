
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentType, documentToBucketMap } from '@/types/document';

export const useDocumentDeleter = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteDocument = async (
    documentId: string,
    documentType: DocumentType
  ): Promise<boolean> => {
    setIsDeleting(true);
    try {
      // Get the bucket name for this document type
      const bucketName = documentToBucketMap[documentType];
      const filePath = `documents/${documentId}`;

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting document from storage:', storageError);
      }

      // Delete the metadata from the database
      const { error: metadataError } = await supabase
        .from('document_metadata')
        .delete()
        .eq('id', documentId);

      if (metadataError) {
        console.error('Error deleting document metadata:', metadataError);
        throw metadataError;
      }

      toast({
        title: 'Document Deleted',
        description: 'The document has been successfully deleted',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteDocument:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDocument,
    isDeleting
  };
};
