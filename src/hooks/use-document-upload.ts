
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
  const { deleteDocument: deleterFunction, isDeleting } = useDocumentDeleter();

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    loanApplicationId?: string,
    description?: string,
    tags?: string[]
  ): Promise<UploadedDocument | null> => {
    const result = await uploaderFunction(file, documentType, loanApplicationId, description, tags);
    
    if (result) {
      const newDoc: UploadedDocument = {
        ...result,
        uploadedAt: new Date().toISOString()
      };
      setUploadedDocuments(prev => [...prev, newDoc]);
      return newDoc;
    }
    
    return null;
  };

  // Create a wrapper function that accepts either one or two arguments
  const deleteDocument = async (documentId: string, documentType?: DocumentType): Promise<void> => {
    // If documentType is not provided, try to find it from the uploaded documents
    let docType = documentType;
    if (!docType) {
      const doc = uploadedDocuments.find(doc => doc.id === documentId);
      if (doc?.documentType) {
        docType = doc.documentType;
      } else {
        console.error('Document type not provided and not found in uploaded documents');
        return;
      }
    }
    
    const success = await deleterFunction(documentId, docType);
    
    if (success) {
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  return {
    isUploading,
    isDeleting,
    uploadProgress,
    uploadedDocuments,
    uploadDocument,
    getDocumentUrl,
    deleteDocument,
    setUploadedDocuments
  };
}
