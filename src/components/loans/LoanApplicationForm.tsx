
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoanDetailsForm from './LoanDetailsForm';
import { DocumentsUploadSection } from './DocumentsUploadSection';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, ChevronRight, FilePlus, FileText, Loader2, Printer } from 'lucide-react';
import { useLoanApplicationForm } from '@/hooks/use-loan-application-form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import { LoanApplicationValues } from '@/types/loan';

const guarantorSchema = z.object({
  guarantor1_consent: z.boolean().refine((val) => val === true, {
    message: "Guarantor 1 must consent to be a guarantor",
  }),
  guarantor2_consent: z.boolean().optional(),
});

const LoanApplicationForm = () => {
  const {
    handleSubmit,
    isSubmitting,
    clients,
    isLoadingClients,
    preselectedClientId,
    activeTab,
    setActiveTab,
    loanApplicationId,
    submissionError,
    handleFinish,
    regenerateLoanId,
    loanIdentificationNumber,
    
    // Document states and handlers
    idDocuments,
    isUploadingId,
    collateralPhotos,
    isUploadingCollateral,
    propertyDocuments,
    isUploadingProperty,
    loanAgreements,
    isUploadingLoan,
    handleUploadIdDocument,
    handleUploadCollateralPhoto,
    handleUploadPropertyDocument,
    handleUploadLoanAgreement,
    handleDeleteIdDocument,
    handleDeleteCollateralPhoto,
    handleDeletePropertyDocument,
    handleDeleteLoanAgreement
  } = useLoanApplicationForm();
  
  const { toast } = useToast();
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [hasNecessaryDocuments, setHasNecessaryDocuments] = useState(false);

  const form = useForm({
    resolver: zodResolver(guarantorSchema),
    defaultValues: {
      guarantor1_consent: false,
      guarantor2_consent: false,
    }
  });

  // Check if necessary documents are present
  useEffect(() => {
    if (idDocuments && idDocuments.length > 0) {
      setHasNecessaryDocuments(true);
    } else {
      setHasNecessaryDocuments(false);
    }
  }, [idDocuments]);
  
  const handlePrint = () => {
    window.print();
  };

  const isReadyToPrint = loanApplicationId && hasNecessaryDocuments && isFormCompleted && form.formState.isValid;
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="documents" disabled={!loanApplicationId}>Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          {submissionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{submissionError}</span>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FileText className="h-5 w-5 mr-2 text-purple-700" />
              <span className="text-sm font-semibold">Loan ID:</span>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                {loanIdentificationNumber}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={regenerateLoanId}
              >
                Regenerate
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              This unique identification number will be assigned to your loan application.
            </p>
          </div>
          
          <LoanDetailsForm
            onSubmit={(values: any) => {
              // Add the missing properties expected by LoanApplicationValues
              const enhancedValues: LoanApplicationValues = {
                ...values,
                client_type: values.client_id ? 'existing' : 'new',
                terms_accepted: true,
                loan_amount: values.loan_amount.toString(), // Convert to string to match the expected type
              };
              handleSubmit(enhancedValues);
              setIsFormCompleted(true);
            }}
            isSubmitting={isSubmitting}
            clients={clients}
            isLoadingClients={isLoadingClients}
            preselectedClientId={preselectedClientId}
          />
          
          {loanApplicationId && (
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setActiveTab("documents")}
                className="bg-purple-700 hover:bg-purple-800"
              >
                Continue to Documents
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline"
              onClick={() => setActiveTab("details")}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>
          </div>
          
          <DocumentUpload
            title="Identification Document"
            documentType="id_document"
            onUpload={handleUploadIdDocument}
            isUploading={isUploadingId}
            uploadedFiles={idDocuments.map(doc => ({
              name: doc.fileName,
              size: doc.fileSize,
              type: doc.fileType,
              id: doc.id,
              documentType: doc.documentType
            }))}
            onDelete={handleDeleteIdDocument}
            iconType="id"
            enableScanning={true}
          />
          
          <DocumentUpload
            title="Collateral Photo"
            documentType="collateral_photo"
            onUpload={handleUploadCollateralPhoto}
            isUploading={isUploadingCollateral}
            uploadedFiles={collateralPhotos.map(doc => ({
              name: doc.fileName,
              size: doc.fileSize,
              type: doc.fileType,
              id: doc.id,
              documentType: doc.documentType
            }))}
            onDelete={handleDeleteCollateralPhoto}
            iconType="photo"
            enableCapture={true}
          />
          
          <DocumentUpload
            title="Property Document"
            documentType="property_document"
            onUpload={handleUploadPropertyDocument}
            isUploading={isUploadingProperty}
            uploadedFiles={propertyDocuments.map(doc => ({
              name: doc.fileName,
              size: doc.fileSize,
              type: doc.fileType,
              id: doc.id,
              documentType: doc.documentType
            }))}
            onDelete={handleDeletePropertyDocument}
            iconType="property"
          />
          
          <DocumentUpload
            title="Loan Agreement"
            documentType="loan_agreement"
            onUpload={handleUploadLoanAgreement}
            isUploading={isUploadingLoan}
            uploadedFiles={loanAgreements.map(doc => ({
              name: doc.fileName,
              size: doc.fileSize,
              type: doc.fileType,
              id: doc.id,
              documentType: doc.documentType
            }))}
            onDelete={handleDeleteLoanAgreement}
            iconType="document"
          />

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-medium">Guarantor Consent Declarations</h3>
              </div>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="guarantor1_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that Guarantor 1 has consented to act as guarantor for this loan and has agreed to their details being used for this purpose.
                          </FormLabel>
                          <FormDescription>
                            The guarantor will be responsible if the loan defaults.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guarantor2_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that Guarantor 2 has consented to act as guarantor for this loan and has agreed to their details being used for this purpose.
                          </FormLabel>
                          <FormDescription>
                            (Optional) The guarantor will be responsible if the loan defaults.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              onClick={handleFinish}
              className="bg-purple-700 hover:bg-purple-800"
              disabled={!hasNecessaryDocuments || !form.getValues().guarantor1_consent}
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Application
            </Button>
          </div>
          
          {isReadyToPrint && (
            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 border border-green-200 dark:border-green-900 rounded-lg">
              <div className="flex items-center mb-4 text-green-600 dark:text-green-400">
                <Check className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-medium">Application Ready for Printing</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your loan application has been completed successfully. You can now print it for your records or for submission.
              </p>
              <Button 
                onClick={handlePrint} 
                className="w-full sm:w-auto"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Application
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanApplicationForm;
