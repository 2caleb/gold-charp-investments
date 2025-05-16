
// This is a simple re-export file to maintain backward compatibility
// and avoid modifying too much code
export { DocumentUpload } from '@/components/documents/DocumentUpload';
export type { DocumentType } from '@/components/documents/DocumentUpload';

// Add types to fix TypeScript errors if needed
export type DocumentUploadProps = {
  documentType: DocumentType;
  title: string; // Make sure this is required
  onUpload: (file: File, description?: string, tags?: string[]) => Promise<void>;
  isUploading: boolean;
  uploadedFiles?: Array<{
    name: string;
    size: number;
    type: string;
    id: string;
    documentType: DocumentType;
  }>;
  onDelete?: (id: string) => Promise<void>;
  iconType?: string;
  enableScanning?: boolean;
  enableCapture?: boolean;
};
