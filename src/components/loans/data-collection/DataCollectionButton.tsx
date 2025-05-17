
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, RotateCw, Printer } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { useDataCollection } from '@/hooks/use-data-collection';
import { ClientInformationForm } from './ClientInformationForm';
import { DocumentsTab } from './DocumentsTab';
import { DataCollectionFormValues } from './schema';

export interface DataCollectionButtonProps {
  onDataCollected?: (data: any) => void;
}

export const DataCollectionButton: React.FC<DataCollectionButtonProps> = ({
  onDataCollected = () => {}
}) => {
  // Force desktop view for better UX
  useDesktopRedirect();
  
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
    handleRegenerateLoanId
  } = useDataCollection();
  
  // Handle form submission and notify parent component
  const handleSubmit = async (values: DataCollectionFormValues) => {
    await onSubmit(values);
    
    // Notify parent component if needed
    if (clientId) {
      onDataCollected({
        ...values,
        client_id: clientId,
        application_id: applicationId
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Collect Client Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Client Data Collection</span>
            <div className="flex items-center">
              <span className="text-sm font-normal text-gray-500 mr-2">Loan ID:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {generatedLoanId}
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRegenerateLoanId} 
                className="ml-2"
                title="Generate new loan ID"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              {applicationId && formReady && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                  className="ml-2"
                  title="Print client data"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              {(!applicationId || !formReady) && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="ml-2 opacity-30"
                  title="Complete form to enable printing"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Enter client information and upload required documents
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="client">Client Information</TabsTrigger>
            <TabsTrigger value="documents" disabled={!clientId}>Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client">
            <ClientInformationForm 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
              generatedLoanId={generatedLoanId} 
            />
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsTab
              applicationId={applicationId}
              onFinish={handleFinish}
              onUploadIdDocument={handleUploadIdDocument}
              onUploadPassportPhoto={handleUploadPassportPhoto}
              onUploadGuarantor1Photo={handleUploadGuarantor1Photo}
              onUploadGuarantor2Photo={handleUploadGuarantor2Photo}
              isUploadingId={isUploadingId}
              isUploadingPassport={isUploadingPassport}
              isUploadingGuarantor1={isUploadingGuarantor1}
              isUploadingGuarantor2={isUploadingGuarantor2}
              idDocuments={idDocuments}
              passportPhotos={passportPhotos}
              guarantor1Photos={guarantor1Photos}
              guarantor2Photos={guarantor2Photos}
              deleteIdDocument={deleteIdDocument}
              deletePassportPhoto={deletePassportPhoto}
              deleteGuarantor1Photo={deleteGuarantor1Photo}
              deleteGuarantor2Photo={deleteGuarantor2Photo}
              formReady={formReady}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
