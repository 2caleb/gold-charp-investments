
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { documentToBucketMap } from '@/types/document';

export function useDocumentDeleter() {
  const { toast } = useToast();

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      // Get document metadata
      const { data: metaData, error: metaError } = await supabase
        .from('document_metadata')
        .select('storage_path, document_type')
        .eq('id', documentId)
        .single();

      if (metaError) throw metaError;
      if (!metaData) throw new Error('Document not found');

      const bucketId = documentToBucketMap[metaData.document_type];
      
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

      toast({
        title: 'Document deleted',
        description: 'The document has been successfully deleted',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Delete failed',
        description: error?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    deleteDocument
  };
}
