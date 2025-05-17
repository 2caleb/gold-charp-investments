
export type DocumentType = 
  | 'id_document' 
  | 'passport_photo' 
  | 'guarantor1_photo' 
  | 'guarantor2_photo'
  | 'collateral_photo'
  | 'property_document'
  | 'loan_agreement';

export type BucketType =
  | 'client_documents'
  | 'loan_documents'
  | 'collateral_documents'
  | 'guarantor_documents'
  | 'property_documents';

// Maps document types to their respective storage buckets
export const documentToBucketMap: Record<DocumentType, BucketType> = {
  'id_document': 'client_documents',
  'passport_photo': 'client_documents',
  'guarantor1_photo': 'guarantor_documents',
  'guarantor2_photo': 'guarantor_documents',
  'collateral_photo': 'collateral_documents',
  'property_document': 'property_documents',
  'loan_agreement': 'loan_documents'
};

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: DocumentType;
  description?: string;
  tags?: string[];
  url?: string;
  uploadedAt?: string;
  category?: string;
}
