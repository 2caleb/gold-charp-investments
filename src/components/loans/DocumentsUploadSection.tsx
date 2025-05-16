
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { UploadedDocument } from '@/hooks/use-document-upload';
import { Badge } from '@/components/ui/badge';

interface DocumentsUploadSectionProps {
  loanApplicationId: string | null;
  isLoadingDocuments: boolean;
  onFinish: () => void;
  // ID Documents
  idDocuments: UploadedDocument[];
  isUploadingId: boolean;
  handleUploadIdDocument: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeleteIdDocument: (id: string) => Promise<void>;
  getIdDocumentUrl: (id: string) => Promise<string | null>;
  verifyDocument?: (id: string) => Promise<void>;
  // Collateral Photos
  collateralPhotos: UploadedDocument[];
  isUploadingCollateral: boolean;
  handleUploadCollateralPhoto: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeleteCollateralPhoto: (id: string) => Promise<void>;
  getCollateralPhotoUrl: (id: string) => Promise<string | null>;
  // Property Documents
  propertyDocuments: UploadedDocument[];
  isUploadingProperty: boolean;
  handleUploadPropertyDocument: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeletePropertyDocument: (id: string) => Promise<void>;
  getPropertyDocumentUrl: (id: string) => Promise<string | null>;
  // Loan Agreements
  loanAgreements: UploadedDocument[];
  isUploadingLoan: boolean;
  handleUploadLoanAgreement: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleDeleteLoanAgreement: (id: string) => Promise<void>;
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
  verifyDocument,
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
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});
  
  const handleVerifyDocument = async (documentId: string) => {
    if (!verifyDocument) return;
    
    setVerifyingDocId(documentId);
    try {
      await verifyDocument(documentId);
      setVerificationResults(prev => ({
        ...prev,
        [documentId]: { isAuthentic: Math.random() > 0.3 } // Mock verification for UI demonstration
      }));
    } finally {
      setVerifyingDocId(null);
    }
  };
  
  const renderVerificationBadge = (documentId: string) => {
    const result = verificationResults[documentId];
    if (!result) return null;
    
    if (verifyingDocId === documentId) {
      return (
        <Badge variant="outline" className="ml-2 bg-gray-100">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Verifying...
        </Badge>
      );
    }
    
    if (result.isAuthentic) {
      return (
        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Invalid
      </Badge>
    );
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
            enableScanning={true}
          />
          
          <DocumentUpload 
            title="Collateral Photos"
            documentType="collateral_photo"
            onUpload={handleUploadCollateralPhoto}
            isUploading={isUploadingCollateral}
            iconType="photo"
            enableCapture={true}
          />
        </div>
        
        <div className="space-y-6">
          <DocumentUpload 
            title="Property Documents"
            documentType="property_document"
            onUpload={handleUploadPropertyDocument}
            isUploading={isUploadingProperty}
            iconType="property"
            enableScanning={true}
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
          onDelete={handleDeleteIdDocument}
          onPreview={getIdDocumentUrl}
          onVerify={verifyDocument ? (id) => handleVerifyDocument(id) : undefined}
          isVerifying={verifyingDocId !== null}
          renderBadge={renderVerificationBadge}
        />
        
        <DocumentList
          title="Collateral Photos"
          documents={collateralPhotos}
          onDelete={handleDeleteCollateralPhoto}
          onPreview={getCollateralPhotoUrl}
        />
        
        <DocumentList
          title="Property Documents"
          documents={propertyDocuments}
          onDelete={handleDeletePropertyDocument}
          onPreview={getPropertyDocumentUrl}
          onVerify={verifyDocument ? (id) => handleVerifyDocument(id) : undefined}
          isVerifying={verifyingDocId !== null}
          renderBadge={renderVerificationBadge}
        />
        
        <DocumentList
          title="Loan Agreements"
          documents={loanAgreements}
          onDelete={handleDeleteLoanAgreement}
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
