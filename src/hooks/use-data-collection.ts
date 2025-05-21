import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types/loan';

interface LoanApplicationForm {
  client_type: string;
  client_id?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  id_number?: string;
  address?: string;
  employment_status?: string;
  monthly_income?: string;
  loan_type: string;
  loan_amount: string;
  purpose_of_loan: string;
  notes?: string;
}

export const useDataCollection = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Fetch clients
  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('client_name')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching clients:", error);
        setError(error.message);
        toast({
          title: "Error fetching clients",
          description: error.message || "Failed to load clients.",
          variant: "destructive",
        });
        return;
      }

      setClients(data as Client[]);
    } catch (error: any) {
      console.error("Unexpected error fetching clients:", error);
      setError(error.message);
      toast({
        title: "Unexpected error",
        description: error.message || "An unexpected error occurred while loading clients.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Update the insert function to handle monthly_income as a number
  const insertApplication = async (values: LoanApplicationForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Determine if we're working with an existing client or creating a new one
      const isExistingClient = values.client_type === 'existing' && values.client_id;
      let clientId = values.client_id;
      let clientName = '';
      
      // If creating new client, do so first
      if (!isExistingClient) {
        const { data: clientData, error: clientError } = await supabase
          .from('client_name')
          .insert({
            full_name: values.full_name || '',
            phone_number: values.phone_number || '',
            email: values.email || null,
            id_number: values.id_number || '',
            address: values.address || '',
            employment_status: values.employment_status || '',
            monthly_income: parseFloat(values.monthly_income || '0'), // Convert to number
            created_at: new Date().toISOString(),
          })
          .select('id, full_name')
          .single();
        
        if (clientError) {
          console.error("Error creating client:", clientError);
          throw new Error(`Failed to create client: ${clientError.message}`);
        }
        
        if (!clientData) throw new Error("Failed to create client: No data returned");
        
        clientId = clientData.id;
        clientName = clientData.full_name;
      } else {
        // Find the selected client's details
        const selectedClient = clients.find(client => client.id === values.client_id);
        if (selectedClient) {
          clientName = selectedClient.full_name;
        }
      }
      
      if (!clientId || !clientName) {
        throw new Error("Client information is incomplete");
      }
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Format application data
      const applicationData = {
        client_id: clientId,
        client_name: clientName,
        loan_type: values.loan_type,
        loan_amount: values.loan_amount,
        purpose_of_loan: values.purpose_of_loan,
        created_by: user.id,
        phone_number: values.phone_number || '', 
        id_number: values.id_number || '',
        employment_status: values.employment_status || '',
        monthly_income: parseFloat(values.monthly_income || '0'), // Convert to number
        address: values.address || '',
        current_approver: user.id,
        notes: values.notes || '',
        status: 'submitted',
        created_at: new Date().toISOString(),
      };
      
      // Insert the application
      const { data, error } = await supabase
        .from('loan_applications')
        .insert(applicationData)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating application:", error);
        throw new Error(`Failed to submit application: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Failed to submit application: No data returned");
      }
      
      // Create notification for the submission
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            message: `Your loan application for ${values.loan_type} has been submitted successfully.`,
            related_to: 'loan_application',
            entity_id: data.id
          });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Non-critical error, don't throw
      }
      
      toast({
        title: "Loan application submitted",
        description: "Your loan application has been submitted successfully.",
      });

      return data;
    } catch (error: any) {
      setError(error.message);
      console.error("Error submitting application:", error);
      
      toast({
        title: "Error submitting application",
        description: error.message || "There was a problem submitting your application.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    insertApplication,
    fetchClients,
    clients,
    isLoadingClients,
  };
};
