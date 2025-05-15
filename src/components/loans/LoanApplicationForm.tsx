import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import RealTimeUpdates from './RealTimeUpdates';
import { Loader2 } from 'lucide-react';
import { Client } from '@/types/schema';
import { useDocumentUpload, UploadedDocument } from '@/hooks/use-document-upload';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';

const loanApplicationSchema = z.object({
  client_id: z.string().uuid("Please select a client"),
  loan_type: z.string().min(1, "Please select a loan type"),
  loan_amount: z.string().min(1, "Loan amount is required"),
  purpose_of_loan: z.string().min(5, "Please provide the purpose of the loan"),
  notes: z.string().optional(),
});

type LoanApplicationValues = z.infer<typeof loanApplicationSchema>;

const LoanApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const preselectedClientId = searchParams.get('client');
  const [realtimeUpdate, setRealtimeUpdate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loanApplicationId, setLoanApplicationId] = useState<string | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Document upload hooks
  const {
    isUploading: isUploadingId,
    uploadDocument: uploadIdDocument,
    uploadedDocuments: idDocuments,
    getDocumentUrl: getIdDocumentUrl,
    deleteDocument: deleteIdDocument,
    setUploadedDocuments: setIdDocuments
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingCollateral,
    uploadDocument: uploadCollateralPhoto,
    uploadedDocuments: collateralPhotos,
    getDocumentUrl: getCollateralPhotoUrl,
    deleteDocument: deleteCollateralPhoto,
    setUploadedDocuments: setCollateralPhotos
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingProperty,
    uploadDocument: uploadPropertyDocument,
    uploadedDocuments: propertyDocuments,
    getDocumentUrl: getPropertyDocumentUrl,
    deleteDocument: deletePropertyDocument,
    setUploadedDocuments: setPropertyDocuments
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingLoan,
    uploadDocument: uploadLoanAgreement,
    uploadedDocuments: loanAgreements,
    getDocumentUrl: getLoanAgreementUrl,
    deleteDocument: deleteLoanAgreement,
    setUploadedDocuments: setLoanAgreements
  } = useDocumentUpload();

  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      client_id: preselectedClientId || "",
      loan_type: "",
      loan_amount: "",
      purpose_of_loan: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, full_name, phone_number, id_number, address, employment_status, monthly_income');
        
        if (error) throw error;
        
        setClients(data || []);
      } catch (error: any) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Failed to load clients",
          description: "Could not load client list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [toast]);

  useEffect(() => {
    // Load documents if loan application ID exists
    if (loanApplicationId) {
      fetchDocuments();
    }
  }, [loanApplicationId]);

  const fetchDocuments = async () => {
    if (!loanApplicationId) return;

    setIsLoadingDocuments(true);
    try {
      // Fetch document metadata from the database
      const { data, error } = await supabase
        .from('document_metadata')
        .select('*')
        .eq('loan_application_id', loanApplicationId);

      if (error) throw error;

      if (data) {
        // Group documents by type
        const idDocs: UploadedDocument[] = [];
        const collateralDocs: UploadedDocument[] = [];
        const propertyDocs: UploadedDocument[] = [];
        const loanDocs: UploadedDocument[] = [];

        data.forEach(doc => {
          const formattedDoc: UploadedDocument = {
            id: doc.id,
            fileName: doc.file_name,
            fileSize: doc.file_size,
            fileType: doc.content_type,
            documentType: doc.document_type as any,
            description: doc.description || undefined,
            tags: doc.tags || undefined
          };

          if (doc.document_type === 'id_document') {
            idDocs.push(formattedDoc);
          } else if (doc.document_type === 'collateral_photo') {
            collateralDocs.push(formattedDoc);
          } else if (doc.document_type === 'property_document') {
            propertyDocs.push(formattedDoc);
          } else if (doc.document_type === 'loan_agreement') {
            loanDocs.push(formattedDoc);
          }
        });

        setIdDocuments(idDocs);
        setCollateralPhotos(collateralDocs);
        setPropertyDocuments(propertyDocs);
        setLoanAgreements(loanDocs);
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Failed to load documents",
        description: error.message || "Could not load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const onSubmit = async (values: LoanApplicationValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a loan application",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert loan_amount from string to number
      const numericAmount = parseFloat(values.loan_amount.replace(/,/g, ''));
      
      // Get client data
      const selectedClient = clients.find(c => c.id === values.client_id);
      if (!selectedClient) {
        throw new Error("Selected client not found");
      }
      
      // Get the manager's user ID (in a real app, you might fetch this from profiles table)
      // Using current user for demo purposes
      const manager_id = user.id;
      
      // Insert the loan application using direct REST API call
      const response = await fetch(`https://bjsxekgraxbfqzhbqjff.supabase.co/rest/v1/loan_applications`, {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3hla2dyYXhiZnF6aGJxamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjMxNzUsImV4cCI6MjA2MjY5OTE3NX0.XdyZ0y4pGsaARlhHEYs3zj-shj0i3szpOkRZC_CQ18Y',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          client_name: selectedClient.full_name,
          phone_number: selectedClient.phone_number,
          id_number: selectedClient.id_number,
          address: selectedClient.address,
          loan_type: values.loan_type,
          loan_amount: String(numericAmount),
          purpose_of_loan: values.purpose_of_loan,
          notes: values.notes,
          created_by: user.id,
          current_approver: manager_id,
          employment_status: selectedClient.employment_status,
          monthly_income: selectedClient.monthly_income.toString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit loan application");
      }

      const data = await response.json();
      // Get the loan application ID
      if (data && data[0] && data[0].id) {
        setLoanApplicationId(data[0].id);
        
        // Switch to documents tab after successful submission
        setActiveTab("documents");
        
        toast({
          title: "Loan application submitted",
          description: "Your loan application has been submitted successfully. You can now upload supporting documents.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to get loan application ID");
      }
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: "Failed to submit application",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadIdDocument = async (file: File, description?: string, tags?: string[]) => {
    if (!loanApplicationId) {
      toast({
        title: "Submit application first",
        description: "Please submit the loan application before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadIdDocument(file, 'id_document', loanApplicationId, description, tags);
  };

  const handleUploadCollateralPhoto = async (file: File, description?: string, tags?: string[]) => {
    if (!loanApplicationId) {
      toast({
        title: "Submit application first",
        description: "Please submit the loan application before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadCollateralPhoto(file, 'collateral_photo', loanApplicationId, description, tags);
  };

  const handleUploadPropertyDocument = async (file: File, description?: string, tags?: string[]) => {
    if (!loanApplicationId) {
      toast({
        title: "Submit application first",
        description: "Please submit the loan application before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadPropertyDocument(file, 'property_document', loanApplicationId, description, tags);
  };

  const handleUploadLoanAgreement = async (file: File, description?: string, tags?: string[]) => {
    if (!loanApplicationId) {
      toast({
        title: "Submit application first",
        description: "Please submit the loan application before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadLoanAgreement(file, 'loan_agreement', loanApplicationId, description, tags);
  };

  const handleDeleteIdDocument = async (id: string) => {
    await deleteIdDocument(id);
  };

  const handleDeleteCollateralPhoto = async (id: string) => {
    await deleteCollateralPhoto(id);
  };

  const handleDeletePropertyDocument = async (id: string) => {
    await deletePropertyDocument(id);
  };

  const handleDeleteLoanAgreement = async (id: string) => {
    await deleteLoanAgreement(id);
  };

  // Handle realtime updates
  const handleLoanUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setRealtimeUpdate('New loan application has been submitted.');
    } else if (payload.eventType === 'UPDATE') {
      setRealtimeUpdate(`Loan application ${payload.new.id} was updated.`);
    }
  };

  const handleFinish = () => {
    // Navigate to the loan applications list or another appropriate page
    navigate('/loan-applications');
    
    toast({
      title: "Process complete",
      description: "Your loan application and documents have been submitted successfully",
    });
  };

  return (
    <>
      <RealTimeUpdates onLoanUpdate={handleLoanUpdate} />
      
      {realtimeUpdate && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
          {realtimeUpdate}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="details">Application Details</TabsTrigger>
            <TabsTrigger value="documents" disabled={!loanApplicationId}>Supporting Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Loan Application Details</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoadingClients || !!preselectedClientId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {isLoadingClients ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading...</span>
                              </div>
                            ) : clients.length > 0 ? (
                              clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.full_name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-gray-500">No clients found</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loan_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mortgage">Mortgage Loan</SelectItem>
                            <SelectItem value="business">Business Loan</SelectItem>
                            <SelectItem value="personal">Personal Loan</SelectItem>
                            <SelectItem value="education">Education Loan</SelectItem>
                            <SelectItem value="auto">Auto Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loan_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount (UGX)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose_of_loan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose of Loan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Explain why you're applying for this loan" 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information about this application" 
                            {...field} 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Loan Application"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="documents">
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <p>Loading documents...</p>
              </div>
            ) : (
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
                    />
                    
                    <DocumentUpload 
                      title="Collateral Photos"
                      documentType="collateral_photo"
                      onUpload={handleUploadCollateralPhoto}
                      isUploading={isUploadingCollateral}
                      iconType="photo"
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <DocumentUpload 
                      title="Property Documents"
                      documentType="property_document"
                      onUpload={handleUploadPropertyDocument}
                      isUploading={isUploadingProperty}
                      iconType="property"
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
                  />
                  
                  <DocumentList
                    title="Loan Agreements"
                    documents={loanAgreements}
                    onDelete={handleDeleteLoanAgreement}
                    onPreview={getLoanAgreementUrl}
                  />
                </div>
                
                <div className="flex justify-end mt-8">
                  <Button onClick={handleFinish} className="bg-purple-700 hover:bg-purple-800">
                    Complete Application
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default LoanApplicationForm;
