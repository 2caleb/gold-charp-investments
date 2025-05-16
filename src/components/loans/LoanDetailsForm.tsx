
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Client } from '@/types/schema';

export interface LoanApplicationValues {
  client_type: 'existing' | 'new';
  client_id?: string;
  full_name?: string;
  phone_number?: string;
  id_number?: string;
  address?: string;
  employment_status?: string;
  monthly_income?: string;
  email?: string;
  loan_type: string;
  loan_amount: string;
  loan_term: string;
  term_unit: 'daily' | 'weekly' | 'monthly';
  purpose_of_loan: string;
  applicant_name?: string;
  has_collateral: boolean;
  collateral_description?: string;
  notes?: string;
  terms_accepted: boolean;
}

const formSchema = z.object({
  client_type: z.enum(['existing', 'new']),
  client_id: z.string().optional(),
  full_name: z.string().min(2, { message: 'Name is required' }).optional(),
  phone_number: z.string().min(10, { message: 'Valid phone number is required' }).optional(),
  id_number: z.string().min(1, { message: 'ID number is required' }).optional(),
  address: z.string().optional(),
  employment_status: z.string().optional(),
  monthly_income: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  loan_type: z.string(),
  loan_amount: z.string().min(1, { message: 'Loan amount is required' }),
  loan_term: z.string().min(1, { message: 'Loan term is required' }),
  term_unit: z.enum(['daily', 'weekly', 'monthly']),
  purpose_of_loan: z.string().min(1, { message: 'Purpose of loan is required' }),
  applicant_name: z.string().optional(),
  has_collateral: z.boolean().default(false),
  collateral_description: z.string().optional(),
  notes: z.string().optional(),
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions to proceed' }),
  }),
});

interface LoanDetailsFormProps {
  onSubmit: (values: LoanApplicationValues) => void;
  isSubmitting: boolean;
  clients: Client[];
  isLoadingClients: boolean;
  preselectedClientId?: string | null;
}

const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({
  onSubmit,
  isSubmitting,
  clients,
  isLoadingClients,
  preselectedClientId,
}) => {
  const [showCollateralFields, setShowCollateralFields] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_type: 'existing',  // This is now set as a default value
      loan_type: 'personal',
      loan_amount: '',
      loan_term: '12',
      term_unit: 'monthly',
      purpose_of_loan: '',
      has_collateral: false,
      terms_accepted: true,
    },
  });
  
  // Watch client type to conditionally show fields
  const clientType = form.watch('client_type');
  const hasCollateral = form.watch('has_collateral');
  
  // Update collateral fields visibility when checkbox changes
  useEffect(() => {
    setShowCollateralFields(hasCollateral);
  }, [hasCollateral]);
  
  // Set preselected client if provided
  useEffect(() => {
    if (preselectedClientId) {
      form.setValue('client_type', 'existing');
      form.setValue('client_id', preselectedClientId);
    }
  }, [preselectedClientId, form]);
  
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure client_type is always passed (this is the key fix for the build error)
    const formattedValues: LoanApplicationValues = {
      ...values,
      client_type: values.client_type || 'existing',
    };
    onSubmit(formattedValues);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Client Information Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg md:text-xl font-medium mb-4 text-purple-800 dark:text-purple-400">Client Information</h2>
          
          <FormField
            control={form.control}
            name="client_type"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Client Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing" />
                      <Label htmlFor="existing">Existing Client</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new">New Client</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Select whether this is an existing client or a new client
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Show client selection for existing clients */}
          {clientType === 'existing' && (
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingClients ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : clients.length === 0 ? (
                        <div className="p-4 text-center">No clients found</div>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name} - {client.phone_number}
                          </SelectItem>
                        ))
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
          
          {/* Show new client fields */}
          {clientType === 'new' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <Input placeholder="+256 700 000000" {...field} />
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
                        <Input placeholder="CM12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="johndoe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Kampala" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'employed'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self_employed">Self Employed</SelectItem>
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
                      <FormLabel>Monthly Income (UGX)</FormLabel>
                      <FormControl>
                        <Input placeholder="1,000,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Loan Details Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg md:text-xl font-medium mb-4 text-purple-800 dark:text-purple-400">Loan Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectItem value="personal">Personal Loan</SelectItem>
                      <SelectItem value="business">Business Loan</SelectItem>
                      <SelectItem value="mortgage">Mortgage Loan</SelectItem>
                      <SelectItem value="auto">Auto Loan</SelectItem>
                      <SelectItem value="education">Education Loan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of loan you are applying for
                  </FormDescription>
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
                    <Input placeholder="5,000,000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you wish to borrow
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <FormField
                control={form.control}
                name="loan_term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                          <SelectValue placeholder="Select term unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Days</SelectItem>
                        <SelectItem value="weekly">Weeks</SelectItem>
                        <SelectItem value="monthly">Months</SelectItem>
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Purpose of Loan</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how you plan to use this loan"
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide details on how you plan to use the loan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="applicant_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Applicant Name (if different from client)</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave blank if same as client" {...field} />
                  </FormControl>
                  <FormDescription>
                    Fill only if the applicant is different from the client
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Collateral Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg md:text-xl font-medium mb-4 text-purple-800 dark:text-purple-400">Collateral Information</h2>
          
          <FormField
            control={form.control}
            name="has_collateral"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    This loan application includes collateral
                  </FormLabel>
                  <FormDescription>
                    Check this if you are providing assets as security for the loan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {showCollateralFields && (
            <FormField
              control={form.control}
              name="collateral_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collateral Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the assets you are providing as collateral"
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the collateral being offered
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        {/* Additional Notes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg md:text-xl font-medium mb-4 text-purple-800 dark:text-purple-400">Additional Information</h2>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any additional information that may be relevant"
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Terms and Conditions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <FormField
            control={form.control}
            name="terms_accepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the terms and conditions
                  </FormLabel>
                  <FormDescription>
                    By checking this box, you confirm that all provided information is accurate and you agree to the loan terms.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-purple-700 hover:bg-purple-800 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Loan Application'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoanDetailsForm;
