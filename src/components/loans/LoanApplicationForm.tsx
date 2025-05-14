
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Client {
  id: string;
  full_name: string;
}

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
          .select('id, full_name')
          .order('full_name', { ascending: true });

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
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
      
      // Get the manager's user ID (in a real app, you might fetch this from profiles table)
      // Using current user for demo purposes
      const manager_id = user.id;
      
      // Insert the loan application
      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          client_name: clients.find(c => c.id === values.client_id)?.full_name || "",
          phone_number: "", // This would come from the client's record in a real app
          id_number: "", // This would come from the client's record in a real app
          address: "", // This would come from the client's record in a real app
          loan_type: values.loan_type,
          loan_amount: String(numericAmount), // Convert to string to match existing schema
          purpose_of_loan: values.purpose_of_loan,
          notes: values.notes,
          created_by: user.id,
          current_approver: manager_id,
          employment_status: "" // This would come from the client's record in a real app
        })
        .select('id')
        .single();

      if (error) {
        throw error;
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

  return (
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
  );
};

export default LoanApplicationForm;
