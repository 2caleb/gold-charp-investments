
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Camera,
  Percent,
} from 'lucide-react';
import { ClientInformationForm } from './ClientInformationForm';
import { DocumentsTab } from './DocumentsTab';
import { DataCollectionFormValues } from './schema';
import { DataCollectionDialogHeader } from './DataCollectionDialogHeader';
import { InterestRateTab } from './InterestRateTab';

interface DataCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSubmitting: boolean;
  formReady: boolean;
  generatedLoanId: string;
  clientId: string | null;
  applicationId: string | null;
  isUploadingId: boolean;
  isUploadingPassport: boolean;
  isUploadingGuarantor1: boolean;
  isUploadingGuarantor2: boolean;
  idDocuments: any[];
  passportPhotos: any[];
  guarantor1Photos: any[];
  guarantor2Photos: any[];
  onSubmit: (values: DataCollectionFormValues) => Promise<any>;
  handleUploadIdDocument: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleUploadPassportPhoto: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleUploadGuarantor1Photo: (file: File, description?: string, tags?: string[]) => Promise<void>;
  handleUploadGuarantor2Photo: (file: File, description?: string, tags?: string[]) => Promise<void>;
  deleteIdDocument: (id: string) => Promise<void>;
  deletePassportPhoto: (id: string) => Promise<void>;
  deleteGuarantor1Photo: (id: string) => Promise<void>;
  deleteGuarantor2Photo: (id: string) => Promise<void>;
  handleFinish: () => void;
  handleRegenerateLoanId: () => void;
  hasAllRequiredDocuments: boolean;
  recordingOnsite: boolean;
  setRecordingOnsite: (value: boolean) => void;
  onCompleteOnboarding: () => void;
}

export const DataCollectionDialog: React.FC<DataCollectionDialogProps> = ({
  open,
  onOpenChange,
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
  hasAllRequiredDocuments,
  recordingOnsite,
  setRecordingOnsite,
  onCompleteOnboarding
}) => {
  // Create wrapper functions to match the expected signature
  const handleDeleteIdDocument = async (fileId: string) => {
    await deleteIdDocument(fileId);
  };

  const handleDeletePassportPhoto = async (fileId: string) => {
    await deletePassportPhoto(fileId);
  };

  const handleDeleteGuarantor1Photo = async (fileId: string) => {
    await deleteGuarantor1Photo(fileId);
  };

  const handleDeleteGuarantor2Photo = async (fileId: string) => {
    await deleteGuarantor2Photo(fileId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl border-0 rounded-lg transition-all duration-300 ease-in-out">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="flex items-center justify-between">
            <DataCollectionDialogHeader 
              generatedLoanId={generatedLoanId}
              onRegenerateLoanId={handleRegenerateLoanId}
              applicationId={applicationId}
              formReady={formReady}
            />
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete the client information and upload all required documents to establish a new banking relationship
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
              <FileText className="h-4 w-4 mr-2" />
              Client Information
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={!clientId} className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
              <Camera className="h-4 w-4 mr-2" />
              Documents & Media
            </TabsTrigger>
            <TabsTrigger value="terms" disabled={!hasAllRequiredDocuments} className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
              <Percent className="h-4 w-4 mr-2" />
              Terms & Rates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="client" className="animate-fade-in">
            <ClientInformationForm 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
              generatedLoanId={generatedLoanId} 
            />
          </TabsContent>
          
          <TabsContent value="documents" className="animate-fade-in">
            <DocumentsTab
              applicationId={applicationId}
              onFinish={() => setActiveTab('terms')}
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
              deleteIdDocument={handleDeleteIdDocument}
              deletePassportPhoto={handleDeletePassportPhoto}
              deleteGuarantor1Photo={handleDeleteGuarantor1Photo}
              deleteGuarantor2Photo={handleDeleteGuarantor2Photo}
              formReady={formReady}
              enableScanning={true}
              enableMediaCapture={true}
              showAttachments={true}
              recordingOnsite={recordingOnsite}
              setRecordingOnsite={setRecordingOnsite}
            />
          </TabsContent>
          
          <TabsContent value="terms" className="animate-fade-in">
            <InterestRateTab onCompleteOnboarding={onCompleteOnboarding} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
