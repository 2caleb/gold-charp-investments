
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { UploadedDocument } from '@/hooks/use-document-upload';

interface DocumentsUploadSectionProps {
  loanApplicationId: string | null;
  isLoadingDocuments: boolean;
  onFinish: () => void;
  // ID Documents
  idDocuments: UploadedDocument[];
  isUploadingId: boolean;
  handleUploadIdDocument: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeleteIdDocument: (id: string) => Promise<boolean>;
  getIdDocumentUrl: (id: string) => Promise<string | null>;
  // Collateral Photos
  collateralPhotos: UploadedDocument[];
  isUploadingCollateral: boolean;
  handleUploadCollateralPhoto: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeleteCollateralPhoto: (id: string) => Promise<boolean>;
  getCollateralPhotoUrl: (id: string) => Promise<string | null>;
  // Property Documents
  propertyDocuments: UploadedDocument[];
  isUploadingProperty: boolean;
  handleUploadPropertyDocument: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeletePropertyDocument: (id: string) => Promise<boolean>;
  getPropertyDocumentUrl: (id: string) => Promise<string | null>;
  // Loan Agreements
  loanAgreements: UploadedDocument[];
  isUploadingLoan: boolean;
  handleUploadLoanAgreement: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeleteLoanAgreement: (id: string) => Promise<boolean>;
  getLoanAgreementUrl: (id: string) => Promise<string | null>;
}

export const DocumentsUploadSection: React.FC<DocumentsUploadSectionProps> = ({
  loanApplicationId,
  isLoadingDocuments,
  onFinish,
  // ID Documents
  idDocuments,
  isUploadingId,
  handleUploadIdDocument,
  handleDeleteIdDocument,
  getIdDocumentUrl,
  // Collateral Photos
  collateralPhotos,
  isUploadingCollateral,
  handleUploadCollateralPhoto,
  handleDeleteCollateralPhoto,
  getCollateralPhotoUrl,
  // Property Documents
  propertyDocuments,
  isUploadingProperty,
  handleUploadPropertyDocument,
  handleDeletePropertyDocument,
  getPropertyDocumentUrl,
  // Loan Agreements
  loanAgreements,
  isUploadingLoan,
  handleUploadLoanAgreement,
  handleDeleteLoanAgreement,
  getLoanAgreementUrl,
}) => {
  // Create wrapper functions that return Promise<void> for each delete handler
  const handleIdDocumentDelete = async (id: string): Promise<void> => {
    await handleDeleteIdDocument(id);
  };
  
  const handleCollateralPhotoDelete = async (id: string): Promise<void> => {
    await handleDeleteCollateralPhoto(id);
  };
  
  const handlePropertyDocumentDelete = async (id: string): Promise<void> => {
    await handleDeletePropertyDocument(id);
  };
  
  const handleLoanAgreementDelete = async (id: string): Promise<void> => {
    await handleDeleteLoanAgreement(id);
  };

  if (!loanApplicationId) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No application submitted</AlertTitle>
        <AlertDescription>
          Please submit a loan application first before uploading supporting documents.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingDocuments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Supporting Documents</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Upload the required documents to support your loan application. All documents are securely stored and only accessible to authorized personnel.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <DocumentUpload 
            title="National ID"
            documentType="id_document"
            onUpload={handleUploadIdDocument}
            isUploading={isUploadingId}
            iconType="id"
          />
          
          <DocumentUpload 
            title="Collateral Photos"
            documentType="collateral_photo"
            onUpload={handleUploadCollateralPhoto}
            isUploading={isUploadingCollateral}
            iconType="photo"
          />
        </div>
        
        <div className="space-y-6">
          <DocumentUpload 
            title="Property Documents"
            documentType="property_document"
            onUpload={handleUploadPropertyDocument}
            isUploading={isUploadingProperty}
            iconType="property"
          />
          
          <DocumentUpload 
            title="Loan Agreement"
            documentType="loan_agreement"
            onUpload={handleUploadLoanAgreement}
            isUploading={isUploadingLoan}
            iconType="document"
          />
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Uploaded Documents</h3>
        
        <DocumentList
          title="National ID Documents"
          documents={idDocuments}
          onDelete={handleIdDocumentDelete}
          onPreview={getIdDocumentUrl}
        />
        
        <DocumentList
          title="Collateral Photos"
          documents={collateralPhotos}
          onDelete={handleCollateralPhotoDelete}
          onPreview={getCollateralPhotoUrl}
        />
        
        <DocumentList
          title="Property Documents"
          documents={propertyDocuments}
          onDelete={handlePropertyDocumentDelete}
          onPreview={getPropertyDocumentUrl}
        />
        
        <DocumentList
          title="Loan Agreements"
          documents={loanAgreements}
          onDelete={handleLoanAgreementDelete}
          onPreview={getLoanAgreementUrl}
        />
      </div>
      
      <div className="flex justify-end mt-8">
        <Button onClick={onFinish} className="bg-purple-700 hover:bg-purple-800">
          Complete Application
        </Button>
      </div>
    </div>
  );
};
