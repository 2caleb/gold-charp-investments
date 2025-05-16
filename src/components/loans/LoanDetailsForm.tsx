
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Client } from '@/types/schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';

export const loanSchema = z.object({
  client_type: z.enum(['existing', 'new']),
  client_id: z.string().optional(),
  // New client fields
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  id_number: z.string().optional(),
  address: z.string().optional(),
  employment_status: z.string().optional(),
  monthly_income: z.string().optional(),
  // Loan fields
  loan_type: z.string(),
  loan_amount: z.string(),
  loan_term: z.string(),
  term_unit: z.enum(["daily", "weekly", "monthly"]),
  purpose_of_loan: z.string(),
  applicant_name: z.string().optional(),
  has_collateral: z.boolean(),
  collateral_description: z.string().optional(),
  notes: z.string().optional(),
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
})
.refine(
  data => {
    if (data.client_type === 'existing') {
      return !!data.client_id;
    }
    return true;
  },
  {
    message: 'Please select a client',
    path: ['client_id'],
  }
)
.refine(
  data => {
    if (data.client_type === 'new') {
      return !!data.full_name && !!data.phone_number && !!data.id_number;
    }
    return true;
  },
  {
    message: 'Required fields are missing for new client',
    path: ['full_name'],
  }
);

export type LoanApplicationValues = z.infer<typeof loanSchema>;

interface LoanDetailsFormProps {
  clients: Client[];
  isLoadingClients: boolean;
  preselectedClientId?: string | null;
  onSubmit: (values: LoanApplicationValues) => void;
  isSubmitting: boolean;
  loanIdentificationNumber: string;
  onRegenerateLoanId: () => void;
}

const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({
  clients,
  isLoadingClients,
  preselectedClientId,
  onSubmit,
  isSubmitting,
  loanIdentificationNumber,
  onRegenerateLoanId
}) => {
  // Force desktop view for better UX
  useDesktopRedirect();

  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      client_type: preselectedClientId ? 'existing' : 'new',
      client_id: preselectedClientId || '',
      full_name: '',
      phone_number: '',
      email: '',
      id_number: '',
      address: '',
      employment_status: 'employed',
      monthly_income: '',
      loan_type: 'personal',
      loan_amount: '',
      loan_term: '12',
      term_unit: 'monthly',
      purpose_of_loan: '',
      applicant_name: '',
      has_collateral: false,
      collateral_description: '',
      notes: '',
      terms_accepted: false,
    },
  });

  const clientType = form.watch('client_type');
  const hasCollateral = form.watch('has_collateral');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-1">Loan Application</h2>
            <p className="text-blue-600 dark:text-blue-400">Fill in the details below to submit a new loan application.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="mr-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Loan ID:</p>
              <p className="font-mono font-medium">{loanIdentificationNumber}</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onRegenerateLoanId} 
              className="h-8"
            >
              Regenerate
            </Button>
          </div>
        </div>

        {/* Client Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Client Information</h3>
          
          {/* Client Type Selection */}
          <FormField
            control={form.control}
            name="client_type"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Client Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
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
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Select Existing Client or Enter New Client Details */}
          {clientType === 'existing' ? (
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name} - {client.phone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="space-y-4">
              {/* New Client Form Fields */}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self_employed">Self Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
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
                        <Input type="number" placeholder="1000000" {...field} />
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
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Loan Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="refinance">Refinance Loan</SelectItem>
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
                    <Input placeholder="10,000,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-2">
              <FormField
                control={form.control}
                name="loan_term"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Loan Term</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="term_unit"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Term Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
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
                <FormItem>
                  <FormLabel>Purpose of Loan</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Business expansion, Home purchase" {...field} />
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
                    <Input placeholder="Leave blank if same as client" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="has_collateral"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Loan Collateral</FormLabel>
                  <FormDescription>
                    Does this loan have collateral?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
                      placeholder="Describe the collateral being offered for this loan" 
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
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information about the loan application" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Terms and Conditions */}
        <FormField
          control={form.control}
          name="terms_accepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the terms and conditions for this loan application
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  By accepting, you agree to our loan terms and privacy policy.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </Form>
  );
};

export default LoanDetailsForm;

function FormDescription(props: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground">{props.children}</p>
  );
}
