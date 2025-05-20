
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';
import { InstallmentCalculator } from './InstallmentCalculator';

export interface LoanFormValues {
  client_id: string;
  loan_type: string;
  loan_amount: number;
  employment_status: string;
  purpose_of_loan: string;
  term_length: number;
  term_unit: 'days' | 'weeks' | 'months' | 'years';
}

const formSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  loan_type: z.string().min(1, 'Loan type is required'),
  loan_amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .min(1000, 'Minimum loan amount is 1,000'),
  employment_status: z.string().min(1, 'Employment status is required'),
  purpose_of_loan: z.string().min(3, 'Purpose is required'),
  term_length: z.number().min(1, 'Loan term is required'),
  term_unit: z.enum(['days', 'weeks', 'months', 'years']).default('months'),
});

interface Props {
  onSubmit: (data: LoanFormValues) => void;
  isSubmitting: boolean;
  clients: any[];
  isLoadingClients: boolean;
  preselectedClientId?: string;
}

const LoanDetailsForm = ({ 
  onSubmit, 
  isSubmitting, 
  clients,
  isLoadingClients,
  preselectedClientId 
}: Props) => {
  const { userProfile } = useUser();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get form with validation
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: preselectedClientId || '',
      loan_type: '',
      loan_amount: 0,
      employment_status: '',
      purpose_of_loan: '',
      term_length: 12,
      term_unit: 'months',
    },
  });

  const { watch, setValue } = form;
  
  // Watch values for InstallmentCalculator
  const loanAmount = watch('loan_amount');
  const termLength = watch('term_length');
  const termUnit = watch('term_unit');

  // Set preselected client if provided
  useEffect(() => {
    if (preselectedClientId) {
      setValue('client_id', preselectedClientId);
    }
  }, [preselectedClientId, setValue]);

  // Automatically fill in client's employment status when selected
  const handleClientChange = async (clientId: string) => {
    if (!clientId) return;
    
    try {
      // Look up client details
      const { data: client, error } = await supabase
        .from('client_name')  
        .select('employment_status')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      if (client) {
        setValue('employment_status', client.employment_status);
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const handleFormSubmit = (values: LoanFormValues) => {
    onSubmit(values);
    setIsSubmitted(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleClientChange(value);
                }} 
                value={field.value}
                disabled={isLoadingClients || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading clients...</span>
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="p-2 text-center">No clients found</div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="loan_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                    <SelectItem value="emergency">Emergency Loan</SelectItem>
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
                  <Input 
                    placeholder="Enter loan amount" 
                    type="number" 
                    {...field}
                    onChange={event => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="employment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time Employed</SelectItem>
                  <SelectItem value="part-time">Part-Time Employed</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Briefly describe the purpose of this loan" 
                  className="min-h-[80px]" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="term_length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter term length" 
                    type="number"
                    {...field}
                    onChange={event => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Show installment schedule when loan amount and term are filled */}
        {loanAmount > 0 && termLength > 0 && (
          <InstallmentCalculator 
            loanAmount={loanAmount} 
            duration={termLength} 
            termUnit={termUnit}
            interestRate={15} // Default 15% annual interest rate
          />
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-700 hover:bg-purple-800"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Loan Application
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoanDetailsForm;
