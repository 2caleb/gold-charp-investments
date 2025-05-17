
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  RotateCw, 
  Printer, 
  Camera, 
  VideoCamera,
  ScanLine,
  FileText,
  Percent
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { useDataCollection } from '@/hooks/use-data-collection';
import { ClientInformationForm } from './ClientInformationForm';
import { DocumentsTab } from './DocumentsTab';
import { DataCollectionFormValues } from './schema';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

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
    handleRegenerateLoanId,
    hasAllRequiredDocuments
  } = useDataCollection();
  
  const [interestRate, setInterestRate] = useState<number>(18);
  const [recordingOnsite, setRecordingOnsite] = useState<boolean>(false);
  
  // Handle form submission and notify parent component
  const handleSubmit = async (values: DataCollectionFormValues) => {
    // Include interest rate with the submission
    const enrichedValues = {
      ...values,
      interest_rate: interestRate
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
  };
  
  // Interest rate formatter
  const formatInterestRate = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Client Onboarding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl border-0">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <span className="text-2xl font-serif">Client Onboarding</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-500">Reference ID:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-700">
                  {generatedLoanId}
                </code>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRegenerateLoanId} 
                className="ml-2"
                title="Generate new reference ID"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              {applicationId && formReady && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="ml-2 border-blue-300"
                  title="Print client data"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              {(!applicationId || !formReady) && (
                <Button
                  variant="outline"
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
          <DialogDescription className="text-gray-600">
            Complete the client information and upload all required documents to establish a new banking relationship
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Client Information
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={!clientId} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Camera className="h-4 w-4 mr-2" />
              Documents & Media
            </TabsTrigger>
            <TabsTrigger value="terms" disabled={!hasAllRequiredDocuments} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Percent className="h-4 w-4 mr-2" />
              Terms & Rates
            </TabsTrigger>
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
              deleteIdDocument={deleteIdDocument}
              deletePassportPhoto={deletePassportPhoto}
              deleteGuarantor1Photo={deleteGuarantor1Photo}
              deleteGuarantor2Photo={deleteGuarantor2Photo}
              formReady={formReady}
              enableScanning={true}
              enableMediaCapture={true}
              showAttachments={true}
            />
          </TabsContent>
          
          <TabsContent value="terms">
            <Card className="mb-6 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 font-serif text-gray-800 dark:text-gray-200">Interest Rate Configuration</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div className="col-span-3">
                          <Slider
                            value={[interestRate]}
                            min={1}
                            max={30}
                            step={0.25}
                            onValueChange={(values) => setInterestRate(values[0])}
                            className="my-4"
                          />
                          <div className="flex justify-between text-xs text-gray-500 px-2">
                            <span>1%</span>
                            <span>7.5%</span>
                            <span>15%</span>
                            <span>22.5%</span>
                            <span>30%</span>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                            <Label htmlFor="interest-rate-display" className="text-sm text-gray-500 block mb-2">Annual Interest Rate</Label>
                            <Input
                              id="interest-rate-display"
                              value={formatInterestRate(interestRate)}
                              readOnly
                              className="text-2xl font-bold text-center text-blue-700 bg-transparent border-0 p-0 h-auto focus:ring-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4 font-serif text-gray-800 dark:text-gray-200">Client Declarations</h3>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        By proceeding, the client confirms that all information provided is accurate and complete to the best of their knowledge. 
                        The client authorizes the bank to verify all information provided, including credit history and employment verification.
                        The interest rate of {formatInterestRate(interestRate)} has been clearly communicated and acknowledged by the client.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-8">
                  <Button onClick={handleFinish} className="bg-blue-700 hover:bg-blue-800 text-white">
                    Complete Onboarding
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
