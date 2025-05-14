import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';
import RealTimeUpdates from './RealTimeUpdates';

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
        // Use raw REST API call to fetch clients
        const response = await fetch(`https://bjsxekgraxbfqzhbqjff.supabase.co/rest/v1/clients?select=id,full_name,phone_number,id_number,address,employment_status`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3hla2dyYXhiZnF6aGJxamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjMxNzUsImV4cCI6MjA2MjY5OTE3NX0.XdyZ0y4pGsaARlhHEYs3zj-shj0i3szpOkRZC_CQ18Y',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }
        
        const data = await response.json();
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
          'Content-Type': 'application/json'
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

      toast({
        title: "Loan application submitted",
        description: "Your loan application has been submitted successfully",
        variant: "default",
      });

      // Redirect to loan application details or list
      navigate('/loan-applications');
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

  // Handle realtime updates
  const handleLoanUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setRealtimeUpdate('New loan application has been submitted.');
    } else if (payload.eventType === 'UPDATE') {
      setRealtimeUpdate(`Loan application ${payload.new.id} was updated.`);
    }
  };

  return (
    <>
      <RealTimeUpdates onLoanUpdate={handleLoanUpdate} />
      
      {realtimeUpdate && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
          {realtimeUpdate}
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
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
                      <SelectContent>
                        {isLoadingClients ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name}
                            </SelectItem>
                          ))
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
      </div>
    </>
  );
};

export default LoanApplicationForm;
