
export type DocumentType = 
  'id_document' | 
  'collateral_photo' | 
  'property_document' | 
  'loan_agreement' | 
  'video_evidence' | 
  'passport_photo' | 
  'guarantor1_photo' | 
  'guarantor2_photo';

export type BucketType = 'id_documents' | 'collateral_photos' | 'property_documents' | 'loan_documents' | 'user_photos' | 'guarantor_photos';

export const documentToBucketMap: Record<DocumentType, BucketType> = {
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
