
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentUpload, DocumentType } from "@/hooks/use-document-upload";
import { supabase } from "@/integrations/supabase/client";
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';
import { DataCollectionFormValues } from '@/components/loans/data-collection/schema';

export function useDataCollection() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [generatedLoanId, setGeneratedLoanId] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Client and application state
  const [clientId, setClientId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
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
  
  // Generate loan ID on component mount
  useEffect(() => {
    const newId = generateLoanIdentificationNumber();
    setGeneratedLoanId(newId);
  }, []);
  
  // Check if form is ready for printing
  useEffect(() => {
    setFormReady(Boolean(clientId) && Boolean(applicationId) && idDocuments.length > 0);
  }, [clientId, applicationId, idDocuments.length]);
  
  // Handle form submission
  const onSubmit = async (values: DataCollectionFormValues) => {
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

  return {
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
  };
}
