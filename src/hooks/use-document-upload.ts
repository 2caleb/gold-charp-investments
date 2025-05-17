
import { useState } from 'react';
import { useDocumentUploader } from './useDocumentUploader';
import { useDocumentUrl } from './useDocumentUrl';
import { useDocumentDeleter } from './useDocumentDeleter';
import { DocumentType, UploadedDocument } from '@/types/document';

export type { DocumentType, UploadedDocument } from '@/types/document';

export function useDocumentUpload() {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const { isUploading, uploadProgress, uploadDocument: uploaderFunction } = useDocumentUploader();
  const { getDocumentUrl } = useDocumentUrl();
  const { deleteDocument: deleterFunction } = useDocumentDeleter();

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    loanApplicationId?: string,
    description?: string,
    tags?: string[]
  ): Promise<UploadedDocument | null> => {
    const result = await uploaderFunction(file, documentType, loanApplicationId, description, tags);
    
    if (result) {
      setUploadedDocuments(prev => [...prev, result]);
      return result;
    }
    
    return null;
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    const success = await deleterFunction(documentId);
    
    if (success) {
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
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
