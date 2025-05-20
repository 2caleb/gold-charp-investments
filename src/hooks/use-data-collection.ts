import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataCollectionFormValues } from '@/components/loans/data-collection/schema';
import { useDocumentUpload, UploadedDocument } from '@/hooks/use-document-upload';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

export function useDataCollection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Dialog state
  const [open, setOpen] = useState(false);
  
  // Form state
  const [activeTab, setActiveTab] = useState("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [generatedLoanId, setGeneratedLoanId] = useState<string>('');
  
  // Application data
  const [clientId, setClientId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
  // Document upload hooks
  const {
    isUploading: isUploadingId,
    uploadDocument: uploadIdDocument,
    uploadedDocuments: idDocuments,
    deleteDocument: deleteIdDocument,
    setUploadedDocuments: setIdDocuments
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingPassport,
    uploadDocument: uploadPassportPhoto,
    uploadedDocuments: passportPhotos,
    deleteDocument: deletePassportPhoto,
    setUploadedDocuments: setPassportPhotos
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingGuarantor1,
    uploadDocument: uploadGuarantor1Photo,
    uploadedDocuments: guarantor1Photos,
    deleteDocument: deleteGuarantor1Photo,
    setUploadedDocuments: setGuarantor1Photos
  } = useDocumentUpload();
  
  const {
    isUploading: isUploadingGuarantor2,
    uploadDocument: uploadGuarantor2Photo,
    uploadedDocuments: guarantor2Photos,
    deleteDocument: deleteGuarantor2Photo,
    setUploadedDocuments: setGuarantor2Photos
  } = useDocumentUpload();

  // Has the required documents
  const hasAllRequiredDocuments = idDocuments.length > 0 && passportPhotos.length > 0 && guarantor1Photos.length > 0;
  
  // Generate loan ID when component mounts
  useEffect(() => {
    setGeneratedLoanId(generateLoanIdentificationNumber());
  }, []);
  
  // Handle opening the dialog
  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setActiveTab("client");
      setFormReady(false);
      if (!generatedLoanId) {
        setGeneratedLoanId(generateLoanIdentificationNumber());
      }
    }
  }, [open]);
  
  // Handle form submission
  const onSubmit = async (values: DataCollectionFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit an application",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First, create or find the client
      let client_id = values.client_id;
      
      if (values.isNewClient) {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('client_name')
          .insert({
            full_name: values.full_name,
            phone_number: values.phone_number,
            id_number: values.id_number,
            address: values.address || '',
            employment_status: values.employment_status || 'employed',
            // Convert monthly_income to a number before insertion
            monthly_income: parseFloat(values.monthly_income || '0'),
            email: values.email || null,
            user_id: user.id
          })
          .select()
          .single();
          
        if (clientError) throw clientError;
        client_id = newClient.id;
        setClientId(newClient.id);
      } else {
        setClientId(client_id || null);
      }
      
      // Create loan application
      if (client_id) {
        // Ensure monthly income is converted to a number for the database
        const monthlyIncomeValue = parseFloat(values.monthly_income || '0');
        
        // Insert application with the proper types
        const { data, error } = await supabase
          .from('loan_applications')
          .insert({
            client_name: values.full_name || '',
            phone_number: values.phone_number || '',
            id_number: values.id_number || '',
            address: values.address || '',
            employment_status: values.employment_status || '',
            monthly_income: monthlyIncomeValue.toString(), // Convert to string to match the expected type
            loan_type: values.loan_type || 'personal',
            loan_amount: values.loan_amount || '0',
            loan_id: generatedLoanId,
            purpose_of_loan: values.purpose_of_loan || '',
            notes: values.purpose_of_loan || '',
            created_by: user.id,
            current_approver: user.id // Default to self for demo
          })
          .select();

        if (error) throw error;
        
        // Get the loan application ID
        if (data && data[0] && data[0].id) {
          setApplicationId(data[0].id);
          setFormReady(true);
          setActiveTab("documents");
          
          toast({
            title: "Application saved",
            description: "Client information has been saved successfully.",
          });
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error saving application",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle document uploads
  const handleUploadIdDocument = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Client information required",
        description: "Please save client information first",
        variant: "destructive",
      });
      return;
    }
    
    await uploadIdDocument(file, 'id_document', applicationId, description);
  };
  
  const handleUploadPassportPhoto = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Client information required",
        description: "Please save client information first",
        variant: "destructive",
      });
      return;
    }
    
    await uploadPassportPhoto(file, 'passport_photo', applicationId, description);
  };
  
  const handleUploadGuarantor1Photo = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Client information required",
        description: "Please save client information first",
        variant: "destructive",
      });
      return;
    }
    
    await uploadGuarantor1Photo(file, 'guarantor1_photo', applicationId, description);
  };
  
  const handleUploadGuarantor2Photo = async (file: File, description?: string) => {
    if (!applicationId) {
      toast({
        title: "Client information required",
        description: "Please save client information first",
        variant: "destructive",
      });
      return;
    }
    
    await uploadGuarantor2Photo(file, 'guarantor2_photo', applicationId, description);
  };
  
  // Handle finish button
  const handleFinish = () => {
    setOpen(false);
    
    toast({
      title: "Process complete",
      description: "Client onboarding process completed successfully",
    });
    
    // Optionally navigate somewhere
    // navigate('/dashboard');
  };
  
  // Handle regenerate loan ID
  const handleRegenerateLoanId = () => {
    const newId = generateLoanIdentificationNumber();
    setGeneratedLoanId(newId);
    
    toast({
      title: "ID regenerated",
      description: `New reference ID: ${newId}`,
    });
  };

  const handleAddClient = async (values) => {
    if (!user) return;
    
    setIsAddingClient(true);
    
    try {
      // Parse and convert monthly income to a number
      const parsedIncome = parseFloat(values.monthly_income.replace(/,/g, ''));
      
      const { data, error } = await supabase
        .from('client_name')
        .insert({
          full_name: values.full_name,
          phone_number: values.phone_number,
          id_number: values.id_number,
          address: values.address || '',
          employment_status: values.employment_status || 'employed',
          monthly_income: parsedIncome, // Ensure this is a number
          email: values.email || null,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Client added successfully",
      });
      
      return data;
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleSubmitApplication = async (values, clientData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const loanId = generateLoanIdentificationNumber();
      
      // Parse loan amount as string (keep as string for database)
      const loanAmountString = values.loan_amount.toString();
      
      // Get the manager as approver
      const { data: managers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'manager')
        .limit(1);
      
      const managerId = managers && managers.length > 0 
        ? managers[0].id 
        : user.id; // Fallback to current user if no manager
      
      // Prepare loan application data
      const loanData = {
        client_name: clientData.full_name,
        phone_number: clientData.phone_number,
        id_number: clientData.id_number,
        address: clientData.address,
        employment_status: clientData.employment_status,
        monthly_income: clientData.monthly_income.toString(), // Convert to string for database
        email: clientData.email || null,
        loan_type: values.loan_type,
        loan_amount: loanAmountString,
        loan_term: values.loan_term,
        term_unit: values.term_unit || 'monthly',
        purpose_of_loan: values.purpose_of_loan,
        created_by: user.id,
        current_approver: managerId,
        status: 'submitted',
        loan_id: loanId,
        client_id: clientData.id,
        has_collateral: values.has_collateral || false,
        notes: values.purpose_of_loan || ''
      };
      
      // Insert loan application
      const { data: loanApplication, error } = await supabase
        .from('loan_applications')
        .insert(loanData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Loan application submitted successfully",
      });
      
      return loanApplication;
    } catch (error) {
      console.error("Error submitting loan application:", error);
      toast({
        title: "Error",
        description: "Failed to submit loan application",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
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
    handleRegenerateLoanId,
    hasAllRequiredDocuments,
    handleAddClient,
    handleSubmitApplication
  };
}
