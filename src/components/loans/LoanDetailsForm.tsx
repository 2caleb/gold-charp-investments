
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Client } from '@/types/schema';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export const loanSchema = z.object({
  client_type: z.enum(['existing', 'new']),
  client_id: z.string().optional().nullable(),
  loan_type: z.enum(['mortgage', 'personal', 'business', 'refinance', 'other']),
  loan_amount: z.string().min(1, 'Loan amount is required'),
  loan_term: z.string().min(1, 'Loan term is required'),
  term_unit: z.enum(['days', 'weeks', 'months', 'years']),
  purpose_of_loan: z.string().min(5, 'Please provide more details about the purpose'),
  applicant_name: z.string().optional(),
  has_collateral: z.boolean().default(false),
  collateral_description: z.string().optional(),
  notes: z.string().optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  
  // New client fields
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  id_number: z.string().optional(),
  address: z.string().optional(),
  employment_status: z.enum(['employed', 'self-employed', 'unemployed', 'student', 'retired']).optional(),
  monthly_income: z.string().optional(),
}).refine(data => {
  if (data.client_type === 'existing') {
    return !!data.client_id;
  }
  return true;
}, {
  message: 'Please select a client',
  path: ['client_id'],
}).refine(data => {
  if (data.client_type === 'new') {
    return !!data.full_name && !!data.phone_number && !!data.id_number;
  }
  return true;
}, {
  message: 'Please provide all required client information',
  path: ['full_name'],
});

export type LoanApplicationValues = z.infer<typeof loanSchema>;

interface LoanDetailsFormProps {
  onSubmit: (values: LoanApplicationValues) => void;
  isSubmitting: boolean;
  clients: Client[];
  isLoadingClients: boolean;
  preselectedClientId?: string | null;
  submissionError?: string | null;
  loanApplicationId?: string | null;
  onCollateralChange?: (hasCollateral: boolean) => void;
}

export const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({
  onSubmit,
  isSubmitting,
  clients,
  isLoadingClients,
  preselectedClientId,
  submissionError,
  loanApplicationId,
  onCollateralChange,
}) => {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      client_type: preselectedClientId ? 'existing' : 'new',
      client_id: preselectedClientId || null,
      loan_type: 'personal',
      loan_amount: '',
      loan_term: '12',
      term_unit: 'months',
      purpose_of_loan: '',
      applicant_name: '',
      has_collateral: false,
      collateral_description: '',
      notes: '',
      terms_accepted: false,
      full_name: '',
      phone_number: '',
      email: '',
      id_number: '',
      address: '',
      employment_status: 'employed',
      monthly_income: '',
    },
  });

  const clientType = form.watch('client_type');
  const hasCollateral = form.watch('has_collateral');
  const termsAccepted = form.watch('terms_accepted');
  
  // Auto select client based on URL param
  useEffect(() => {
    if (preselectedClientId) {
      form.setValue('client_type', 'existing');
      form.setValue('client_id', preselectedClientId);
    }
  }, [preselectedClientId, form]);

  // Toggle new client form visibility based on client_type
  useEffect(() => {
    setShowNewClientForm(clientType === 'new');
  }, [clientType]);

  // Inform parent component when terms are accepted
  useEffect(() => {
    if (termsAccepted && typeof window !== 'undefined') {
      // Use a custom event to notify that terms were accepted
      const event = new CustomEvent('termsAccepted', { detail: { accepted: true } });
      window.dispatchEvent(event);
    }
  }, [termsAccepted]);

  // Notify parent component when collateral checkbox changes
  useEffect(() => {
    if (onCollateralChange) {
      onCollateralChange(hasCollateral);
    }
  }, [hasCollateral, onCollateralChange]);

  const { setValue, watch, formState } = form;

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("terms_accepted", e.target.checked);
    
    // Dispatch custom event when terms checkbox is changed
    const customEvent = new CustomEvent('termsCheckboxChanged', { 
      detail: { checked: e.target.checked } 
    });
    window.dispatchEvent(customEvent);
    
    // Also dispatch the original termsAccepted event for backwards compatibility
    if (e.target.checked) {
      const termsAcceptedEvent = new Event('termsAccepted');
      window.dispatchEvent(termsAcceptedEvent);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
        {submissionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}
        
        {loanApplicationId && (
          <Alert className="bg-green-50 border-green-300">
            <AlertTitle>Application Submitted</AlertTitle>
            <AlertDescription>
              Your application has been submitted with ID: {loanApplicationId}. {hasCollateral ? "Please upload supporting documents for your collateral below." : ""}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Client Information</h3>
            <Separator className="mb-6" />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="client_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Client Type</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={field.value === 'existing'}
                            onChange={() => field.onChange('existing')}
                            className="radio"
                          />
                          <span>Existing Client</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={field.value === 'new'}
                            onChange={() => field.onChange('new')}
                            className="radio"
                          />
                          <span>New Client</span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {clientType === 'existing' && (
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        disabled={isLoadingClients}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingClients ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading clients...</span>
                            </div>
                          ) : clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.full_name} - {client.id_number}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No clients found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an existing client from the database
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {showNewClientForm && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium">New Client Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Phone Number*</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
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
                          <FormLabel>National ID Number*</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employment_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employed">Employed</SelectItem>
                              <SelectItem value="self-employed">Self-employed</SelectItem>
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
                      name="monthly_income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Loan Details</h3>
            <Separator className="mb-6" />
            
            <div className="space-y-4">
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
                        <SelectItem value="mortgage">Mortgage</SelectItem>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="business">Business Loan</SelectItem>
                        <SelectItem value="refinance">Refinancing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    <FormLabel>Loan Amount</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="loan_term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                            <SelectValue placeholder="Select unit" />
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
              
              <FormField
                control={form.control}
                name="purpose_of_loan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Loan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe what you need the loan for"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="applicant_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Name (if different from client)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="has_collateral"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (onCollateralChange) {
                            onCollateralChange(checked === true);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I have collateral for this loan
                      </FormLabel>
                      <FormDescription>
                        Indicate if you have any assets to secure the loan
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {hasCollateral && (
                <FormField
                  control={form.control}
                  name="collateral_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your collateral in detail"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information you want to provide"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Terms and conditions */}
              <div className="flex items-center space-x-2 mt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms_accepted" 
                    checked={watch("terms_accepted")} 
                    onCheckedChange={(checked) => {
                      setValue("terms_accepted", checked === true);
                      // Dispatch custom event when terms checkbox is changed
                      const customEvent = new CustomEvent('termsCheckboxChanged', { 
                        detail: { checked: checked === true } 
                      });
                      window.dispatchEvent(customEvent);
                      
                      // Also dispatch the original termsAccepted event for backwards compatibility
                      if (checked === true) {
                        const termsAcceptedEvent = new Event('termsAccepted');
                        window.dispatchEvent(termsAcceptedEvent);
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms_accepted"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions
                    </label>
                    {formState.errors.terms_accepted && (
                      <p className="text-sm text-red-500">
                        You must accept the terms and conditions to continue
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800"
                disabled={isSubmitting || !!loanApplicationId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !!loanApplicationId ? (
                  "Application Submitted"
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};
