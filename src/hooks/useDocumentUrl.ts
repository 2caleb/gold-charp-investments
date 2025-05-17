
import { supabase } from '@/integrations/supabase/client';
import { DocumentType, documentToBucketMap } from '@/types/document';

export const useDocumentUrl = () => {
  const getDocumentUrl = async (
    documentId: string,
    documentType: DocumentType
  ): Promise<string | null> => {
    try {
      const bucketName = documentToBucketMap[documentType];
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(`documents/${documentId}`, 3600); // URL valid for 1 hour

      if (error) {
        console.error('Error getting document URL:', error);
        return null;
      }

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error in getDocumentUrl:', error);
      return null;
    }
  };

  return { getDocumentUrl };
};
