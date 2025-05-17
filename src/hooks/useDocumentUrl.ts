
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { documentToBucketMap } from '@/types/document';

export function useDocumentUrl() {
  const { toast } = useToast();

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

      const bucketId = documentToBucketMap[metaData.document_type];
      
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

  return {
    getDocumentUrl
  };
}
