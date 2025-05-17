
export type DocumentType = 
  | 'id_document' 
  | 'passport_photo' 
  | 'guarantor1_photo' 
  | 'guarantor2_photo' 
  | 'collateral_photo'
  | 'property_document'
  | 'loan_agreement';

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
