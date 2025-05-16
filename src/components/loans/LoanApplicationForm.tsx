
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimeUpdates from './RealTimeUpdates';
import { LoanDetailsForm } from './LoanDetailsForm';
import { DocumentsUploadSection } from './DocumentsUploadSection';
import { RealtimeUpdateNotification } from './RealtimeUpdateNotification';
import { useLoanApplicationForm } from '@/hooks/use-loan-application-form';
import { supabase } from '@/integrations/supabase/client';

const LoanApplicationForm = () => {
  const {
    // State
    isSubmitting,
    clients,
    isLoadingClients,
    preselectedClientId,
    realtimeUpdate,
    activeTab,
    setActiveTab,
    loanApplicationId,
    isLoadingDocuments,
    submissionError,
    
    // Document states
    idDocuments,
    isUploadingId,
    collateralPhotos,
    isUploadingCollateral,
    propertyDocuments,
    isUploadingProperty,
    loanAgreements,
    isUploadingLoan,
    
    // Methods
    handleSubmit,
    handleLoanUpdate,
    handleFinish,
    handleUploadIdDocument,
    handleUploadCollateralPhoto,
    handleUploadPropertyDocument,
    handleUploadLoanAgreement,
    handleDeleteIdDocument,
    handleDeleteCollateralPhoto,
    handleDeletePropertyDocument,
    handleDeleteLoanAgreement,
    getIdDocumentUrl,
    getCollateralPhotoUrl,
    getPropertyDocumentUrl,
    getLoanAgreementUrl
  } = useLoanApplicationForm();

  // Function to verify document using the verify-document Edge Function
  const verifyDocument = async (documentId: string, documentType: string): Promise<void> => {
    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('verify-document', {
        body: { documentId, documentType }
      });
      
      if (error) {
        console.error('Error verifying document:', error);
        return;
      }
      
      console.log('Document verification result:', data);
    } catch (err) {
      console.error('Exception verifying document:', err);
    }
  };

  // Create wrapper functions for document verification that match the expected Promise<void> return type
  const handleVerifyIdDocument = async (id: string): Promise<void> => {
    await verifyDocument(id, 'id_document');
  };
  
  const handleVerifyPropertyDocument = async (id: string): Promise<void> => {
    await verifyDocument(id, 'property_document');
  };

  // Auto-transition to documents tab when loan application is submitted
  useEffect(() => {
    if (loanApplicationId) {
      setActiveTab("documents");
    }
  }, [loanApplicationId, setActiveTab]);
  
  // Listen for terms accepted event to automatically switch to documents tab
  useEffect(() => {
    const handleTermsAccepted = () => {
      if (loanApplicationId) {
        setActiveTab("documents");
      }
    };
    
    window.addEventListener('termsAccepted', handleTermsAccepted);
    
    return () => {
      window.removeEventListener('termsAccepted', handleTermsAccepted);
    };
  }, [loanApplicationId, setActiveTab]);

  return (
    <>
      <RealTimeUpdates onLoanUpdate={handleLoanUpdate} />
      
      <RealtimeUpdateNotification update={realtimeUpdate} />
      
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="details" className="text-base py-3">Application Details</TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="text-base py-3"
              disabled={!loanApplicationId}
            >
              Supporting Documents
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <LoanDetailsForm 
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              clients={clients}
              isLoadingClients={isLoadingClients}
              preselectedClientId={preselectedClientId}
              submissionError={submissionError}
              loanApplicationId={loanApplicationId}
            />
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsUploadSection
              loanApplicationId={loanApplicationId}
              isLoadingDocuments={isLoadingDocuments}
              onFinish={handleFinish}
              // ID Documents
              idDocuments={idDocuments}
              isUploadingId={isUploadingId}
              handleUploadIdDocument={handleUploadIdDocument}
              handleDeleteIdDocument={handleDeleteIdDocument}
              getIdDocumentUrl={getIdDocumentUrl}
              verifyDocument={handleVerifyIdDocument}
              // Collateral Photos
              collateralPhotos={collateralPhotos}
              isUploadingCollateral={isUploadingCollateral}
              handleUploadCollateralPhoto={handleUploadCollateralPhoto}
              handleDeleteCollateralPhoto={handleDeleteCollateralPhoto}
              getCollateralPhotoUrl={getCollateralPhotoUrl}
              // Property Documents
              propertyDocuments={propertyDocuments}
              isUploadingProperty={isUploadingProperty}
              handleUploadPropertyDocument={handleUploadPropertyDocument}
              handleDeletePropertyDocument={handleDeletePropertyDocument}
              getPropertyDocumentUrl={getPropertyDocumentUrl}
              verifyDocument={handleVerifyPropertyDocument}
              // Loan Agreements
              loanAgreements={loanAgreements}
              isUploadingLoan={isUploadingLoan}
              handleUploadLoanAgreement={handleUploadLoanAgreement}
              handleDeleteLoanAgreement={handleDeleteLoanAgreement}
              getLoanAgreementUrl={getLoanAgreementUrl}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default LoanApplicationForm;
