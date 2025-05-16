
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimeUpdates from './RealTimeUpdates';
import { LoanDetailsForm } from './LoanDetailsForm';
import { DocumentsUploadSection } from './DocumentsUploadSection';
import { RealtimeUpdateNotification } from './RealtimeUpdateNotification';
import { useLoanApplicationForm } from '@/hooks/use-loan-application-form';
import { supabase } from '@/integrations/supabase/client';

// Define the correct type for document verification functions
type DocumentVerifier = (id: string) => Promise<void>;

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

  // New state to track collateral selection
  const [hasCollateral, setHasCollateral] = useState(false);

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

  // Handle collateral checkbox change from the form
  const handleCollateralChange = (hasCollateral: boolean) => {
    setHasCollateral(hasCollateral);
  };

  return (
    <>
      <RealTimeUpdates onLoanUpdate={handleLoanUpdate} />
      
      <RealtimeUpdateNotification update={realtimeUpdate} />
      
      <div className="max-w-4xl mx-auto">
        <LoanDetailsForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          clients={clients}
          isLoadingClients={isLoadingClients}
          preselectedClientId={preselectedClientId}
          submissionError={submissionError}
          loanApplicationId={loanApplicationId}
          onCollateralChange={handleCollateralChange}
        />
        
        {hasCollateral && loanApplicationId && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Supporting Documents</h2>
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
          </div>
        )}
      </div>
    </>
  );
};

export default LoanApplicationForm;
