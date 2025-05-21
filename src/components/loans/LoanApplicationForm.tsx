
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLoanApplicationForm } from '@/hooks/use-loan-application-form';
import { LoanApplicationValues } from '@/types/loan';

const formSchema = z.object({
  client_type: z.enum(['new', 'existing'], {
    required_error: 'You need to select a client type.',
  }),
  client_id: z.string().optional(),
  full_name: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }).optional(),
  phone_number: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: 'Invalid phone number',
  }).optional(),
  email: z.string().email({
    message: 'Invalid email address',
  }).optional(),
  id_number: z.string().min(5, {
    message: 'ID number must be at least 5 characters.',
  }).optional(),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }).optional(),
  employment_status: z.string().min(3, {
    message: 'Employment status must be at least 3 characters.',
  }).optional(),
  monthly_income: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Invalid monthly income',
  }).optional(),
  loan_type: z.string().min(3, {
    message: 'Loan type must be at least 3 characters.',
  }),
  loan_amount: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Invalid loan amount',
  }),
  purpose_of_loan: z.string().min(10, {
    message: 'Purpose of loan must be at least 10 characters.',
  }),
  term_unit: z.enum(['days', 'weeks', 'months'], {
    required_error: 'You need to select a term unit.',
  }),
  notes: z.string().optional(),
  terms_accepted: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and conditions.',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface LoanApplicationFormProps {
  onSubmit: (values: LoanApplicationValues) => Promise<any>;
  isSubmitting: boolean;
  clients: { id: string; full_name: string }[];
  isLoadingClients: boolean;
  preselectedClientId?: string;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSubmit,
  isSubmitting,
  clients,
  isLoadingClients,
  preselectedClientId,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_type: 'new',
      terms_accepted: false,
      loan_amount: '',
      loan_type: '',
      purpose_of_loan: '',
      term_unit: 'months',
      client_id: preselectedClientId,
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: FormData) => {
    if (!form.formState.isValid) return;
    
    // Convert the term_unit value to match the expected type
    let termUnit: 'daily' | 'weekly' | 'monthly';
    switch (values.term_unit) {
      case 'days':
        termUnit = 'daily';
        break;
      case 'weeks':
        termUnit = 'weekly';
        break;
      default:
        termUnit = 'monthly';
        break;
    }
    
    const applicationValues: LoanApplicationValues = {
      client_type: values.client_type,
      terms_accepted: values.terms_accepted,
      loan_amount: values.loan_amount,
      client_id: values.client_id,
      loan_type: values.loan_type,
      employment_status: values.employment_status,
      purpose_of_loan: values.purpose_of_loan,
      term_unit: termUnit
    };
    
    if (values.client_type === 'new') {
      applicationValues.full_name = values.full_name;
      applicationValues.phone_number = values.phone_number;
      applicationValues.email = values.email;
      applicationValues.id_number = values.id_number;
      applicationValues.address = values.address;
      applicationValues.employment_status = values.employment_status;
      applicationValues.monthly_income = values.monthly_income;
    }
    
    const result = await onSubmit(applicationValues);
    if (result) {
      navigate('/loan-applications');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="client_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New Client</SelectItem>
                  <SelectItem value="existing">Existing Client</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('client_type') === 'existing' && (
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Client</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingClients}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an existing client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value="loading" disabled>
                        Loading clients...
                      </SelectItem>
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
        )}

        {form.watch('client_type') === 'new' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
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
                      <Input placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
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
                      <Input placeholder="ID Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
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
                  <FormControl>
                    <Input placeholder="Employment Status" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthly_income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Income" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="loan_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Type</FormLabel>
              <FormControl>
                <Input placeholder="Loan Type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loan_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Amount</FormLabel>
              <FormControl>
                <Input placeholder="Loan Amount" {...field} />
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
                <Textarea placeholder="Purpose of Loan" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a term unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms_accepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Accept Terms and Conditions</FormLabel>
                <FormDescription>
                  I agree to the terms and conditions of this loan application.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};

export default LoanApplicationForm;
