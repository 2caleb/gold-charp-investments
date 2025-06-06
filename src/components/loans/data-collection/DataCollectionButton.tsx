
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { useDataCollection } from '@/hooks/use-data-collection';
import { DataCollectionFormValues } from './schema';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DataCollectionDialog } from './DataCollectionDialog';

export interface DataCollectionButtonProps {
  onDataCollected?: (data: any) => void;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'lg' | 'default';
}

export const DataCollectionButton: React.FC<DataCollectionButtonProps> = ({
  onDataCollected = () => {},
  children,
  className,
  size = 'default'
}) => {
  // Force desktop view for better UX
  useDesktopRedirect();
  const navigate = useNavigate();
  
  // Use the data collection hook
  const {
    open,
    setOpen,
    activeTab,
    setActiveTab,
    isSubmitting,
    formReady,
    generatedLoanId,
    clientId,
    applicationId,
    isUploadingId,
    isUploadingPassport,
    isUploadingGuarantor1,
    isUploadingGuarantor2,
    idDocuments,
    passportPhotos,
    guarantor1Photos,
    guarantor2Photos,
    onSubmit,
    handleUploadIdDocument,
    handleUploadPassportPhoto,
    handleUploadGuarantor1Photo,
    handleUploadGuarantor2Photo,
    deleteIdDocument,
    deletePassportPhoto,
    deleteGuarantor1Photo,
    deleteGuarantor2Photo,
    handleFinish,
    handleRegenerateLoanId,
    hasAllRequiredDocuments
  } = useDataCollection();
  
  const [recordingOnsite, setRecordingOnsite] = useState<boolean>(false);
  
  // Handle form submission and notify parent component
  const handleSubmit = async (values: DataCollectionFormValues) => {
    try {
      // Include interest rate with the submission
      const enrichedValues = {
        ...values,
        interest_rate: 18
      };
      
      await onSubmit(enrichedValues);
      
      // Notify parent component if needed
      if (clientId) {
        onDataCollected({
          ...enrichedValues,
          client_id: clientId,
          application_id: applicationId
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle dialog closing to prevent state issues
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset state if dialog is closed without completing
      setActiveTab('client');
    }
  };

  // Improved finish handler with navigation
  const handleCompleteOnboarding = () => {
    handleFinish();
    setOpen(false);
    
    // Navigate to loan applications or dashboard
    navigate('/loan-applications');
  };

  // Create the trigger button
  const triggerButton = (
    <Button 
      className={cn(
        "bg-blue-700 hover:bg-blue-800 text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
        className
      )}
      size={size}
      onClick={() => setOpen(true)}
    >
      {children || (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Client Onboarding
        </>
      )}
    </Button>
  );
  
  return (
    <DataCollectionDialog
      open={open}
      onOpenChange={handleOpenChange}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSubmitting={isSubmitting}
      formReady={formReady}
      generatedLoanId={generatedLoanId}
      clientId={clientId}
      applicationId={applicationId}
      isUploadingId={isUploadingId}
      isUploadingPassport={isUploadingPassport}
      isUploadingGuarantor1={isUploadingGuarantor1}
      isUploadingGuarantor2={isUploadingGuarantor2}
      idDocuments={idDocuments}
      passportPhotos={passportPhotos}
      guarantor1Photos={guarantor1Photos}
      guarantor2Photos={guarantor2Photos}
      onSubmit={handleSubmit}
      handleUploadIdDocument={handleUploadIdDocument}
      handleUploadPassportPhoto={handleUploadPassportPhoto}
      handleUploadGuarantor1Photo={handleUploadGuarantor1Photo}
      handleUploadGuarantor2Photo={handleUploadGuarantor2Photo}
      deleteIdDocument={deleteIdDocument}
      deletePassportPhoto={deletePassportPhoto}
      deleteGuarantor1Photo={deleteGuarantor1Photo}
      deleteGuarantor2Photo={deleteGuarantor2Photo}
      handleFinish={handleFinish}
      handleRegenerateLoanId={handleRegenerateLoanId}
      hasAllRequiredDocuments={hasAllRequiredDocuments}
      recordingOnsite={recordingOnsite}
      setRecordingOnsite={setRecordingOnsite}
      onCompleteOnboarding={handleCompleteOnboarding}
      triggerButton={triggerButton}
    />
  );
};
