
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
  const verifyDocument = async (documentId: string): Promise<void> => {
    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('verify-document', {
        body: { documentId, documentType: 'id_document' }
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
  
  const verifyPropertyDoc = async (documentId: string): Promise<void> => {
    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('verify-document', {
        body: { documentId, documentType: 'property_document' }
      });
      
      if (error) {
        console.error('Error verifying property document:', error);
        return;
      }
      
      console.log('Property document verification result:', data);
    } catch (err) {
      console.error('Exception verifying property document:', err);
    }
  };

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
  
  // Auto-transition to documents tab when loan application is submitted
  useEffect(() => {
    if (loanApplicationId) {
      setActiveTab("documents");
    }
  }, [loanApplicationId, setActiveTab]);
  
  // Listen for checkbox changes to trigger the documents tab
  const handleTermsChange = (event: CustomEvent) => {
    if (event.detail?.checked && loanApplicationId) {
      setActiveTab("documents");
    }
  };

  // Add global event listener for the terms checkbox change
  useEffect(() => {
    window.addEventListener('termsCheckboxChanged', handleTermsChange);
    
    return () => {
      window.removeEventListener('termsCheckboxChanged', handleTermsChange);
    };
  }, [loanApplicationId]);

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
              verifyDocument={verifyDocument}
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
              verifyPropertyDocument={verifyPropertyDoc}
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
