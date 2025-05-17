
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Printer } from 'lucide-react';
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { UploadedDocument } from "@/hooks/use-document-upload";

interface DocumentsTabProps {
  applicationId: string | null;
  onFinish: () => void;
  onUploadIdDocument: (file: File, description?: string) => Promise<void>;
  onUploadPassportPhoto: (file: File, description?: string) => Promise<void>;
  onUploadGuarantor1Photo: (file: File, description?: string) => Promise<void>;
  onUploadGuarantor2Photo: (file: File, description?: string) => Promise<void>;
  isUploadingId: boolean;
  isUploadingPassport: boolean;
  isUploadingGuarantor1: boolean;
  isUploadingGuarantor2: boolean;
  idDocuments: UploadedDocument[];
  passportPhotos: UploadedDocument[];
  guarantor1Photos: UploadedDocument[];
  guarantor2Photos: UploadedDocument[];
  deleteIdDocument: (fileId: string) => Promise<void>;
  deletePassportPhoto: (fileId: string) => Promise<void>;
  deleteGuarantor1Photo: (fileId: string) => Promise<void>;
  deleteGuarantor2Photo: (fileId: string) => Promise<void>;
  formReady: boolean;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  applicationId,
  onFinish,
  onUploadIdDocument,
  onUploadPassportPhoto,
  onUploadGuarantor1Photo,
  onUploadGuarantor2Photo,
  isUploadingId,
  isUploadingPassport,
  isUploadingGuarantor1,
  isUploadingGuarantor2,
  idDocuments,
  passportPhotos,
  guarantor1Photos,
  guarantor2Photos,
  deleteIdDocument,
  deletePassportPhoto,
  deleteGuarantor1Photo,
  deleteGuarantor2Photo,
  formReady
}) => {
  return (
    <div className="space-y-6">
      <DocumentUpload
        title="National ID Document"
        documentType="id_document"
        onUpload={onUploadIdDocument}
        isUploading={isUploadingId}
        uploadedFiles={idDocuments.map(doc => ({
          name: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
          id: doc.id,
          documentType: doc.documentType
        }))}
        onDelete={deleteIdDocument}
        iconType="id"
        enableScanning={true}
        enableCapture={true}
        isPrintable={true}
        isPrintReady={formReady}
      />
      
      <DocumentUpload
        title="Passport Photo"
        documentType="passport_photo"
        onUpload={onUploadPassportPhoto}
        isUploading={isUploadingPassport}
        uploadedFiles={passportPhotos.map(doc => ({
          name: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
          id: doc.id,
          documentType: doc.documentType
        }))}
        onDelete={deletePassportPhoto}
        iconType="user"
        enableCapture={true}
        isPrintable={true}
        isPrintReady={formReady}
      />
      
      <DocumentUpload
        title="Guarantor 1 Photo"
        documentType="guarantor1_photo"
        onUpload={onUploadGuarantor1Photo}
        isUploading={isUploadingGuarantor1}
        uploadedFiles={guarantor1Photos.map(doc => ({
          name: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
          id: doc.id,
          documentType: doc.documentType
        }))}
        onDelete={deleteGuarantor1Photo}
        iconType="user"
        enableCapture={true}
        isPrintable={true}
        isPrintReady={formReady}
      />
      
      <DocumentUpload
        title="Guarantor 2 Photo (Optional)"
        documentType="guarantor2_photo"
        onUpload={onUploadGuarantor2Photo}
        isUploading={isUploadingGuarantor2}
        uploadedFiles={guarantor2Photos.map(doc => ({
          name: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
          id: doc.id,
          documentType: doc.documentType
        }))}
        onDelete={deleteGuarantor2Photo}
        iconType="user"
        enableCapture={true}
        isPrintable={true}
        isPrintReady={formReady}
      />
      
      <div className="flex justify-end mt-8">
        <Button onClick={() => window.print()} className="mr-4" disabled={!formReady}>
          <Printer className="mr-2 h-4 w-4" />
          Print All Documents
        </Button>
        
        <Button onClick={onFinish} className="w-full md:w-auto">
          <Check className="mr-2 h-4 w-4" />
          Finish
        </Button>
      </div>
    </div>
  );
};
