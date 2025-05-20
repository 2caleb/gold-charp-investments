import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client, LoanApplicationValues } from '@/types/loan';
import { useDocumentUpload, UploadedDocument } from '@/hooks/use-document-upload';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

export function useLoanApplicationForm() {
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
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loanIdentificationNumber, setLoanIdentificationNumber] = useState<string>('');
  
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

  // Generate a loan ID when the hook is initialized
  useEffect(() => {
    setLoanIdentificationNumber(generateLoanIdentificationNumber());
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        // Changed from 'clients' to 'client_name' to match the actual table name
        const { data, error } = await supabase
          .from('client_name')
          .select('id, full_name, phone_number, id_number, address, employment_status, monthly_income, created_at, updated_at, user_id, email');
        
        if (error) throw error;
        
        // Ensure the data matches the Client type
        const typedClients: Client[] = data.map(client => ({
          id: client.id,
          full_name: client.full_name,
          phone_number: client.phone_number,
          id_number: client.id_number,
          address: client.address,
          employment_status: client.employment_status,
          monthly_income: client.monthly_income,
          created_at: client.created_at,
          updated_at: client.updated_at || undefined,
          user_id: client.user_id || undefined,
          email: client.email || null
        }));
        
        setClients(typedClients);
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

  const handleSubmit = async (values: LoanApplicationValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a loan application",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Convert loan_amount from string to number for calculation but keep as string for database
      const numericAmount = parseFloat(values.loan_amount.replace(/,/g, ''));
      
      // Handle client data based on whether it's a new or existing client
      let clientId = values.client_id;
      let clientData = {
        full_name: '',
        phone_number: '',
        id_number: '',
        address: '',
        employment_status: '',
        monthly_income: 0,
        email: null as string | null
      };
      
      // If this is a new client, create the client first
      if (values.client_type === 'new') {
        if (!values.full_name || !values.phone_number || !values.id_number) {
          throw new Error("Missing required client information");
        }
        
        // Create new client - changed from 'clients' to 'client_name'
        const { data: newClientData, error: newClientError } = await supabase
          .from('client_name')
          .insert({
            full_name: values.full_name,
            phone_number: values.phone_number,
            id_number: values.id_number,
            address: values.address || '',
            employment_status: values.employment_status || 'employed',
            monthly_income: parseFloat(values.monthly_income || '0'),
            email: values.email || null,
            user_id: user.id
          })
          .select('id, full_name, phone_number, id_number, address, employment_status, monthly_income, email')
          .single();
          
        if (newClientError) throw newClientError;
        
        clientId = newClientData.id;
        clientData = {
          full_name: newClientData.full_name,
          phone_number: newClientData.phone_number,
          id_number: newClientData.id_number,
          address: newClientData.address,
          employment_status: newClientData.employment_status,
          monthly_income: newClientData.monthly_income,
          email: newClientData.email
        };
        
        // Add the new client to the clients list
        setClients(prevClients => [...prevClients, { ...newClientData, created_at: new Date().toISOString() }]);
        
        toast({
          title: "New client created",
          description: `Created client profile for ${newClientData.full_name}`,
        });
      } else {
        // Get existing client data
        const selectedClient = clients.find(c => c.id === clientId);
        if (!selectedClient) {
          throw new Error("Selected client not found");
        }
        
        clientData = {
          full_name: selectedClient.full_name,
          phone_number: selectedClient.phone_number,
          id_number: selectedClient.id_number,
          address: selectedClient.address,
          employment_status: selectedClient.employment_status,
          monthly_income: selectedClient.monthly_income,
          email: selectedClient.email
        };
      }
      
      // Get the manager's user ID (in a real app, you might fetch this from profiles table)
      // Using current user for demo purposes
      const manager_id = user.id;
      
      // Convert monthly_income to string before insertion
      const monthlyIncomeStr = clientData.monthly_income.toString();
      
      // Insert the loan application
      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          // Don't include client_id directly as it might not be in the schema
          // Instead use these fields that match the database table
          client_name: clientData.full_name,
          phone_number: clientData.phone_number,
          id_number: clientData.id_number,
          address: clientData.address,
          loan_type: values.loan_type,
          loan_amount: String(numericAmount),
          loan_term: values.loan_term,
          purpose_of_loan: values.purpose_of_loan,
          applicant_name: values.applicant_name || clientData.full_name,
          has_collateral: values.has_collateral,
          collateral_description: values.collateral_description || '',
          notes: values.notes || '',
          // terms_accepted: values.terms_accepted,
          created_by: user.id,
          current_approver: manager_id,
          employment_status: clientData.employment_status,
          monthly_income: monthlyIncomeStr,
          email: clientData.email,
          loan_id: loanIdentificationNumber // Add the loan identification number
        })
        .select();

      if (error) throw error;

      // Get the loan application ID
      if (data && data[0] && data[0].id) {
        setLoanApplicationId(data[0].id);
        
        // Switch to documents tab after successful submission
        setActiveTab("documents");
        
        toast({
          title: "Loan application submitted",
          description: `Your loan application has been submitted successfully with ID: ${loanIdentificationNumber}. You can now upload supporting documents.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to get loan application ID");
      }
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      setSubmissionError(error.message || "An unexpected error occurred");
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

  // Handle realtime updates
  const handleLoanUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setRealtimeUpdate('New loan application has been submitted.');
    } else if (payload.eventType === 'UPDATE') {
      setRealtimeUpdate(`Loan application ${payload.new.id} was updated.`);
    }
  };

  const regenerateLoanId = () => {
    const newId = generateLoanIdentificationNumber();
    setLoanIdentificationNumber(newId);
    
    toast({
      title: "Loan ID Regenerated",
      description: `New loan ID: ${newId}`,
    });
  };

  const handleFinish = () => {
    // Navigate to the loan applications list or another appropriate page
    navigate('/loan-applications');
    
    toast({
      title: "Process complete",
      description: "Your loan application and documents have been submitted successfully",
    });
  };

  return {
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
    loanIdentificationNumber,
    
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
    regenerateLoanId,
    handleUploadIdDocument,
    handleUploadCollateralPhoto,
    handleUploadPropertyDocument,
    handleUploadLoanAgreement,
    handleDeleteIdDocument: deleteIdDocument,
    handleDeleteCollateralPhoto: deleteCollateralPhoto,
    handleDeletePropertyDocument: deletePropertyDocument,
    handleDeleteLoanAgreement: deleteLoanAgreement,
    getIdDocumentUrl,
    getCollateralPhotoUrl,
    getPropertyDocumentUrl,
    getLoanAgreementUrl
  };
}
