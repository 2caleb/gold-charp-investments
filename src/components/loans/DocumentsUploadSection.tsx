
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Camera, ScanLine, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { Badge } from '@/components/ui/badge';
import { UploadedDocument } from '@/types/document';
import { Card } from '@/components/ui/card';

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
  verifyPropertyDocument?: (id: string) => Promise<void>;
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
  verifyPropertyDocument,
  // Loan Agreements
  loanAgreements,
  isUploadingLoan,
  handleUploadLoanAgreement,
  handleDeleteLoanAgreement,
  getLoanAgreementUrl,
}) => {
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isCapturingMedia, setIsCapturingMedia] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const handleVerifyIdDocument = async (documentId: string) => {
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
  
  const handleVerifyPropertyDocument = async (documentId: string) => {
    if (!verifyPropertyDocument) return;
    
    setVerifyingDocId(documentId);
    try {
      await verifyPropertyDocument(documentId);
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

  // Functions to handle document preview
  const simulateMediaCapture = () => {
    setIsCapturingMedia(true);
    setTimeout(() => {
      setIsCapturingMedia(false);
      // Simulate capturing and processing media
      const mockFile = new File([""], "captured_document.jpg", { type: "image/jpeg" });
      handleUploadIdDocument(mockFile, "Captured via camera");
    }, 2000);
  };

  const simulateDocumentScanning = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Simulate document scanning
      const mockFile = new File([""], "scanned_document.pdf", { type: "application/pdf" });
      handleUploadPropertyDocument(mockFile, "Scanned document");
    }, 2500);
  };

  if (!loanApplicationId) {
    return (
      <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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
        <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-600" />
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-medium flex items-center text-blue-900 dark:text-blue-400">
          <FileText className="h-5 w-5 mr-2 text-blue-700" />
          Supporting Documents
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
          Upload the required documents to support your loan application. All documents are securely stored and only accessible to authorized personnel.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px]">
              <div className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent p-4 border-b border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-400 flex items-center">
                  <ScanLine className="h-4 w-4 mr-2 text-blue-700" />
                  ID Documents
                </h4>
              </div>
              <div className="p-4">
                <DocumentUpload 
                  title="National ID"
                  documentType="id_document"
                  onUpload={handleUploadIdDocument}
                  isUploading={isUploadingId}
                  iconType="id"
                  enableScanning={true}
                />
                
                <div className="mt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center transition-all duration-200 hover:bg-blue-50"
                    onClick={simulateMediaCapture}
                    disabled={isCapturingMedia}
                  >
                    {isCapturingMedia ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Camera className="h-4 w-4 mr-1 text-blue-600" />
                    )}
                    Capture ID
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center transition-all duration-200 hover:bg-blue-50"
                    onClick={simulateDocumentScanning}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <ScanLine className="h-4 w-4 mr-1 text-blue-600" />
                    )}
                    Scan Document
                  </Button>
                </div>
              </div>
            </Card>
          
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
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-6">
        <h3 className="text-lg font-medium flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Uploaded Documents
        </h3>
        
        <DocumentList
          title="National ID Documents"
          documents={idDocuments}
          onDelete={handleDeleteIdDocument}
          onPreview={getIdDocumentUrl}
          onVerify={verifyDocument ? (id) => handleVerifyIdDocument(id) : undefined}
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
          onVerify={verifyPropertyDocument ? (id) => handleVerifyPropertyDocument(id) : undefined}
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
        <Button 
          onClick={onFinish} 
          className="bg-blue-700 hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Complete Application
        </Button>
      </div>
    </div>
  );
};
