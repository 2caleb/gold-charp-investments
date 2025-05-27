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
  const [submissionError, setError] = useState<string | null>(null);
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
      if (!user) {
        console.log('No user found, skipping client fetch');
        return;
      }

      setIsLoadingClients(true);
      try {
        console.log('Fetching clients...');
        const { data, error } = await supabase
          .from('client_name')
          .select('id, full_name, phone_number, id_number, address, employment_status, monthly_income, created_at, updated_at, user_id, email');
        
        if (error) {
          console.error('Client fetch error:', error);
          throw error;
        }
        
        console.log('Clients fetched successfully:', data?.length || 0);
        
        // Ensure the data matches the Client type
        const typedClients: Client[] = (data || []).map(client => ({
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
          description: error.message || "Could not load client list. Please try again.",
          variant: "destructive",
        });
        setClients([]); // Set empty array on error
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [toast, user]);

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
      return null;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Starting loan application submission...', values);

      // Check if this is a new or existing client
      let clientId: string | undefined = undefined;
      let clientName = '';
      
      if (values.client_type === 'existing' && values.client_id) {
        // Existing client
        clientId = values.client_id;
        const selectedClient = clients.find(c => c.id === values.client_id);
        if (selectedClient) {
          clientName = selectedClient.full_name;
        } else {
          throw new Error("Selected client not found");
        }
      } else {
        // Create new client first
        if (!values.full_name || !values.id_number) {
          throw new Error("Client name and ID number are required");
        }
        
        console.log('Creating new client...');
        const { data: newClient, error: clientError } = await supabase
          .from('client_name')
          .insert({
            full_name: values.full_name,
            phone_number: values.phone_number || '',
            email: values.email,
            id_number: values.id_number,
            address: values.address || '',
            employment_status: values.employment_status || '',
            monthly_income: parseFloat(values.monthly_income || '0'),
          })
          .select()
          .single();
        
        if (clientError) {
          console.error('Client creation error:', clientError);
          throw new Error(`Failed to create client: ${clientError.message}`);
        }
        
        clientId = newClient.id;
        clientName = newClient.full_name;
        console.log('New client created successfully:', clientId);
      }
      
      // Now create the loan application
      const loanApplicationData = {
        client_id: clientId,
        client_name: clientName,
        loan_type: values.loan_type,
        loan_amount: values.loan_amount,
        purpose_of_loan: values.purpose_of_loan,
        phone_number: values.phone_number || '',
        id_number: values.id_number || '',
        address: values.address || '',
        employment_status: values.employment_status || '',
        monthly_income: parseFloat(values.monthly_income || '0'),
        notes: values.notes,
        created_by: user.id,
        current_approver: user.id,
        status: 'submitted',
      };
      
      console.log('Creating loan application...', loanApplicationData);
      const { data: loanApplication, error: loanError } = await supabase
        .from('loan_applications')
        .insert(loanApplicationData)
        .select()
        .single();
      
      if (loanError) {
        console.error('Loan application creation error:', loanError);
        throw new Error(`Failed to create loan application: ${loanError.message}`);
      }

      if (!loanApplication?.id) {
        throw new Error('Loan application was created but no ID was returned');
      }

      console.log('Loan application created successfully:', loanApplication.id);
      setLoanApplicationId(loanApplication.id);

      // Create a workflow for this application - using the correct table name
      try {
        const { data: workflow, error: workflowError } = await supabase
          .from('loan_applications_workflow')
          .insert({
            loan_application_id: loanApplication.id,
            current_stage: 'submitted'
          })
          .select()
          .single();

        if (workflowError) {
          console.error("Error creating workflow:", workflowError);
        } else {
          console.log('Workflow created successfully:', workflow?.id);
        }
      } catch (workflowErr) {
        console.error("Workflow creation failed:", workflowErr);
      }

      // Create notification
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            message: `Your loan application for ${values.loan_type} has been submitted successfully.`,
            related_to: 'loan_application',
            entity_id: loanApplication.id
          });
      } catch (notificationErr) {
        console.error("Notification creation failed:", notificationErr);
      }
      
      toast({
        title: "Loan application submitted",
        description: "Your loan application has been submitted successfully.",
      });
      
      return loanApplication;

    } catch (err: any) {
      console.error("Loan application error:", err);
      setError(err.message);
      
      toast({
        title: "Error",
        description: err.message || "Failed to submit loan application",
        variant: "destructive",
      });
      
      return null;
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
