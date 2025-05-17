
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentType } from '@/types/document';

// Re-export the DocumentUpload component
export { DocumentUpload };
export type { DocumentType };

// Add types to fix TypeScript errors
export type DocumentUploadProps = {
  documentType: DocumentType;
  title: string;
  onUpload: (file: File, description?: string, tags?: string[]) => Promise<void>;
  isUploading: boolean;
  uploadedFiles?: Array<{
    name: string;
    size: number;
    type: string;
    id: string;
    documentType: DocumentType;
  }>;
  onDelete?: (id: string, documentType?: DocumentType) => Promise<void>;
  iconType?: string;
  enableScanning?: boolean;
  enableCapture?: boolean;
  isPrintable?: boolean;
  isPrintReady?: boolean;
};
