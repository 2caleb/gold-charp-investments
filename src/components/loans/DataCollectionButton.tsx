import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Download, UserPlus, FileText, Check, X, RotateCw, Printer } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentUpload } from "@/components/documents/DocumentUpload"
import { useDocumentUpload, UploadedDocument, DocumentType } from "@/hooks/use-document-upload"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';
import { Checkbox } from "@/components/ui/checkbox";

// Form schema
const formSchema = z.object({
  full_name: z.string().min(2, { message: "Full name is required" }),
  phone_number: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address is required" }),
  id_number: z.string().min(1, { message: "ID number is required" }),
  employment_status: z.string(),
  monthly_income: z.string(),
  loan_amount: z.string().min(1, { message: "Loan amount is required" }),
  loan_type: z.string(),
  loan_term: z.string(),
  term_unit: z.enum(["daily", "weekly", "monthly"]),
  guarantor1_name: z.string().min(2, { message: "Guarantor name is required" }),
  guarantor1_phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  guarantor1_id_number: z.string().min(1, { message: "ID number is required" }),
  guarantor1_consent: z.boolean().refine((val) => val === true, {
    message: "Guarantor 1 must consent to be a guarantor",
  }),
  guarantor2_name: z.string().optional(),
  guarantor2_phone: z.string().optional(),
  guarantor2_id_number: z.string().optional(),
  guarantor2_consent: z.boolean().optional(),
  purpose_of_loan: z.string().min(1, { message: "Purpose of loan is required" }),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  email: z.string().email().optional().or(z.literal("")),
});

export interface DataCollectionButtonProps {
  onDataCollected?: (data: any) => void;
}

export const DataCollectionButton: React.FC<DataCollectionButtonProps> = ({
  onDataCollected = () => {}
}) => {
  // Force desktop view for better UX
  useDesktopRedirect();
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [generatedLoanId, setGeneratedLoanId] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Generate loan ID on component mount
  useEffect(() => {
    const newId = generateLoanIdentificationNumber();
    setGeneratedLoanId(newId);
  }, []);
  
  // Document upload hooks
  const {
    isUploading: isUploadingId, 
    uploadDocument: uploadIdDocument,
    uploadedDocuments: idDocuments,
    deleteDocument: deleteIdDocument
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingPassport,
    uploadDocument: uploadPassportPhoto,
    uploadedDocuments: passportPhotos,
    deleteDocument: deletePassportPhoto
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingGuarantor1,
    uploadDocument: uploadGuarantor1Photo,
    uploadedDocuments: guarantor1Photos,
    deleteDocument: deleteGuarantor1Photo
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingGuarantor2,
    uploadDocument: uploadGuarantor2Photo,
    uploadedDocuments: guarantor2Photos,
    deleteDocument: deleteGuarantor2Photo
  } = useDocumentUpload();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
      id_number: "",
      employment_status: "employed",
      monthly_income: "",
      loan_amount: "",
      loan_type: "personal",
      loan_term: "12",
      term_unit: "monthly",
      guarantor1_name: "",
      guarantor1_phone: "",
      guarantor1_id_number: "",
      guarantor1_consent: false,
      guarantor2_name: "",
      guarantor2_phone: "",
      guarantor2_id_number: "",
      guarantor2_consent: false,
      purpose_of_loan: "",
      terms_accepted: false,
      email: ""
    },
  });
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
  // Check if form is ready for printing
  useEffect(() => {
    setFormReady(form.formState.isValid && Boolean(clientId) && Boolean(applicationId) && idDocuments.length > 0);
  }, [form.formState.isValid, clientId, applicationId, idDocuments.length]);
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit client data",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create client record
      const { data: clientData, error: clientError } = await supabase
        .from("client_name")
        .insert({
          full_name: values.full_name,
          phone_number: values.phone_number,
          id_number: values.id_number,
          address: values.address,
          employment_status: values.employment_status,
          monthly_income: parseFloat(values.monthly_income),
          user_id: user.id,
          email: values.email || null
        })
        .select()
        .single();
        
      if (clientError) throw clientError;
      
      setClientId(clientData.id);
      
      // Create loan application
      const { data: applicationData, error: applicationError } = await supabase
        .from("loan_applications")
        .insert({
          client_id: clientData.id,
          client_name: values.full_name,
          phone_number: values.phone_number,
          id_number: values.id_number,
          address: values.address,
          employment_status: values.employment_status,
          monthly_income: values.monthly_income,
          loan_type: values.loan_type,
          loan_amount: values.loan_amount,
          loan_term: `${values.loan_term} ${values.term_unit}`,
          purpose_of_loan: values.purpose_of_loan,
          created_by: user.id,
          current_approver: user.id,
          loan_id: generatedLoanId,
          email: values.email || null,
          notes: `Guarantor 1: ${values.guarantor1_name} (${values.guarantor1_phone}, ID: ${values.guarantor1_id_number})${
            values.guarantor2_name ? `\nGuarantor 2: ${values.guarantor2_name} (${values.guarantor2_phone}, ID: ${values.guarantor2_id_number})` : ''
          }`
        })
        .select()
        .single();
        
      if (applicationError) throw applicationError;
      
      setApplicationId(applicationData.id);
      
      setActiveTab("documents");
      
      toast({
        title: "Client data collected",
        description: "Client data has been successfully saved",
        variant: "default",
      });
      
      // Notify parent component if needed
      onDataCollected({
        ...values,
        client_id: clientData.id,
        application_id: applicationData.id
      });
      
    } catch (error: any) {
      console.error("Error submitting client data:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving client data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUploadIdDocument = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Submit client data first",
        description: "Please submit the client data before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadIdDocument(file, 'id_document' as DocumentType, applicationId, description);
  };
  
  const handleUploadPassportPhoto = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Submit client data first",
        description: "Please submit the client data before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadPassportPhoto(file, 'passport_photo' as DocumentType, applicationId, description);
  };
  
  const handleUploadGuarantor1Photo = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Submit client data first",
        description: "Please submit the client data before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadGuarantor1Photo(file, 'guarantor1_photo' as DocumentType, applicationId, description);
  };
  
  const handleUploadGuarantor2Photo = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Submit client data first",
        description: "Please submit the client data before uploading documents",
        variant: "destructive",
      });
      return;
    }
    
    await uploadGuarantor2Photo(file, 'guarantor2_photo' as DocumentType, applicationId, description);
  };
  
  const handleFinish = () => {
    setOpen(false);
    toast({
      title: "Process complete",
      description: "Client data and documents have been collected successfully",
    });
  };
  
  const handleRegenerateLoanId = () => {
    const newId = generateLoanIdentificationNumber();
    setGeneratedLoanId(newId);
    
    toast({
      title: "Loan ID Generated",
      description: `New ID: ${newId}`,
    });
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+256 700 000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="CM12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Kampala" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self_employed">Self Employed</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthly_income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (UGX)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1000000" {...field} />
                        </FormControl>
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
                            <SelectItem value="personal">Personal Loan</SelectItem>
                            <SelectItem value="business">Business Loan</SelectItem>
                            <SelectItem value="mortgage">Mortgage Loan</SelectItem>
                            <SelectItem value="auto">Auto Loan</SelectItem>
                            <SelectItem value="education">Education Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name="loan_term"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Loan Term</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="term_unit"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Term Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Days</SelectItem>
                              <SelectItem value="weekly">Weeks</SelectItem>
                              <SelectItem value="monthly">Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="loan_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount (UGX)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="purpose_of_loan"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Purpose of Loan</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe how you plan to use this loan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Guarantor 1 Information */}
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <h3 className="font-medium text-lg mb-2">Guarantor 1</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="guarantor1_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="guarantor1_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+256 700 000000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="guarantor1_id_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input placeholder="CM12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="guarantor1_consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 col-span-3">
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
                    </div>
                  </div>
                  
                  {/* Guarantor 2 Information */}
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <h3 className="font-medium text-lg mb-2">Guarantor 2 (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="guarantor2_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="guarantor2_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+256 700 000000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="guarantor2_id_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input placeholder="CM12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("guarantor2_name") && (
                        <FormField
                          control={form.control}
                          name="guarantor2_consent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 col-span-3">
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
                                  The guarantor will be responsible if the loan defaults.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="terms_accepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-1 md:col-span-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the terms and conditions for this loan application
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Save Client Data
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="space-y-6">
              <DocumentUpload
                title="National ID Document"
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
                onDelete={(fileId) => deleteIdDocument(fileId)}
                iconType="id"
                enableScanning={true}
                enableCapture={true}
                isPrintable={true}
                isPrintReady={formReady}
              />
              
              <DocumentUpload
                title="Passport Photo"
                documentType="passport_photo"
                onUpload={handleUploadPassportPhoto}
                isUploading={isUploadingPassport}
                uploadedFiles={passportPhotos.map(doc => ({
                  name: doc.fileName,
                  size: doc.fileSize,
                  type: doc.fileType,
                  id: doc.id,
                  documentType: doc.documentType
                }))}
                onDelete={(fileId) => deletePassportPhoto(fileId)}
                iconType="user"
                enableCapture={true}
                isPrintable={true}
                isPrintReady={formReady}
              />
              
              <DocumentUpload
                title="Guarantor 1 Photo"
                documentType="guarantor1_photo"
                onUpload={handleUploadGuarantor1Photo}
                isUploading={isUploadingGuarantor1}
                uploadedFiles={guarantor1Photos.map(doc => ({
                  name: doc.fileName,
                  size: doc.fileSize,
                  type: doc.fileType,
                  id: doc.id,
                  documentType: doc.documentType
                }))}
                onDelete={(fileId) => deleteGuarantor1Photo(fileId)}
                iconType="user"
                enableCapture={true}
                isPrintable={true}
                isPrintReady={formReady}
              />
              
              <DocumentUpload
                title="Guarantor 2 Photo (Optional)"
                documentType="guarantor2_photo"
                onUpload={handleUploadGuarantor2Photo}
                isUploading={isUploadingGuarantor2}
                uploadedFiles={guarantor2Photos.map(doc => ({
                  name: doc.fileName,
                  size: doc.fileSize,
                  type: doc.fileType,
                  id: doc.id,
                  documentType: doc.documentType
                }))}
                onDelete={(fileId) => deleteGuarantor2Photo(fileId)}
                iconType="user"
                enableCapture={true}
                isPrintable={true}
                isPrintReady={formReady}
              />
              
              <div className="flex justify-end mt-8">
                <Button onClick={() => window.print()} className="mr-4" disabled={!formReady}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print All Documents
                </Button>
                
                <Button onClick={handleFinish} className="w-full md:w-auto">
                  <Check className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
