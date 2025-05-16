
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSection,
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
import { Loader2, AlertCircle, User, UserPlus, UserCheck } from 'lucide-react';
import { Client } from '@/types/schema';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const loanApplicationSchema = z.object({
  client_type: z.enum(['existing', 'new']),
  client_id: z.string().uuid("Please select a client").optional().or(z.literal('')),
  applicant_name: z.string().min(1, "Applicant name is required"),
  loan_type: z.string().min(1, "Please select a loan type"),
  loan_amount: z.string().min(1, "Loan amount is required"),
  loan_term: z.string().min(1, "Loan term is required"),
  purpose_of_loan: z.string().min(5, "Please provide the purpose of the loan"),
  has_collateral: z.boolean().default(false),
  collateral_description: z.string().optional(),
  notes: z.string().optional(),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  // New client fields
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  employment_status: z.string().optional(),
  monthly_income: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
});

export type LoanApplicationValues = z.infer<typeof loanApplicationSchema>;

interface LoanDetailsFormProps {
  onSubmit: (values: LoanApplicationValues) => Promise<void>;
  isSubmitting: boolean;
  clients: Client[];
  isLoadingClients: boolean;
  preselectedClientId: string | null;
  submissionError: string | null;
  loanApplicationId: string | null;
}

export const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({
  onSubmit,
  isSubmitting,
  clients,
  isLoadingClients,
  preselectedClientId,
  submissionError,
  loanApplicationId,
}) => {
  const [clientType, setClientType] = useState<'existing' | 'new'>(preselectedClientId ? 'existing' : 'new');
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    preselectedClientId ? clients.find(c => c.id === preselectedClientId) || null : null
  );
  
  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      client_type: preselectedClientId ? 'existing' : 'new',
      client_id: preselectedClientId || "",
      applicant_name: "",
      loan_type: "",
      loan_amount: "",
      loan_term: "",
      purpose_of_loan: "",
      has_collateral: false,
      collateral_description: "",
      notes: "",
      terms_accepted: false,
      full_name: "",
      phone_number: "",
      id_number: "",
      address: "",
      employment_status: "",
      monthly_income: "",
      email: "",
    },
  });

  const hasCollateral = form.watch("has_collateral");
  const currentClientType = form.watch("client_type");
  const currentClientId = form.watch("client_id");
  
  // Update form when client type changes
  const handleClientTypeChange = (value: 'existing' | 'new') => {
    setClientType(value);
    form.setValue('client_type', value);
    
    if (value === 'new') {
      form.setValue('client_id', '');
      setSelectedClient(null);
    }
  };
  
  // Update selected client when client_id changes
  React.useEffect(() => {
    if (currentClientId && currentClientType === 'existing') {
      const client = clients.find(c => c.id === currentClientId);
      if (client) {
        setSelectedClient(client);
        form.setValue('applicant_name', client.full_name);
      }
    }
  }, [currentClientId, clients, form, currentClientType]);
  
  const getClientInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  const renderEmploymentStatusBadge = (status: string) => {
    switch(status) {
      case 'employed':
        return <Badge className="bg-green-600">Employed</Badge>;
      case 'self-employed':
        return <Badge className="bg-blue-600">Self-Employed</Badge>;
      case 'unemployed':
        return <Badge variant="destructive">Unemployed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('en-UG', { style: 'currency', currency: 'UGX' }).replace('UGX', 'UGX ');
  };

  return (
    <>
      {submissionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={clientType} onValueChange={(v) => handleClientTypeChange(v as 'existing' | 'new')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" disabled={!!preselectedClientId}>
                <UserCheck className="mr-2 h-4 w-4" />
                Existing Client
              </TabsTrigger>
              <TabsTrigger value="new" disabled={!!preselectedClientId}>
                <UserPlus className="mr-2 h-4 w-4" />
                New Client
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="existing" className="pt-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Client</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                      }} 
                      defaultValue={field.value}
                      disabled={isLoadingClients || !!preselectedClientId}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-950">
                          <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClients ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{getClientInitials(client.full_name)}</AvatarFallback>
                                </Avatar>
                                {client.full_name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-500">No clients found</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Client information card */}
              {selectedClient && (
                <Card className="mt-4 border border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarFallback className="bg-purple-700 text-white">
                          {getClientInitials(selectedClient.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedClient.full_name}</h3>
                        {renderEmploymentStatusBadge(selectedClient.employment_status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-500">ID Number</p>
                        <p>{selectedClient.id_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{selectedClient.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p>{selectedClient.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly Income</p>
                        <p>{formatCurrency(selectedClient.monthly_income)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter client's full name" {...field} className="bg-white dark:bg-gray-950" />
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
                            <Input placeholder="e.g. 0771234567" {...field} className="bg-white dark:bg-gray-950" />
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
                            <Input placeholder="National ID Number" {...field} className="bg-white dark:bg-gray-950" />
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
                            <Input type="email" placeholder="client@example.com" {...field} className="bg-white dark:bg-gray-950" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Client's residence address" {...field} className="bg-white dark:bg-gray-950" />
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
                              <SelectTrigger className="bg-white dark:bg-gray-950">
                                <SelectValue placeholder="Select employment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employed">Employed</SelectItem>
                              <SelectItem value="self-employed">Self-Employed</SelectItem>
                              <SelectItem value="unemployed">Unemployed</SelectItem>
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
                            <Input placeholder="e.g. 1,500,000" {...field} className="bg-white dark:bg-gray-950" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <FormSection title="Loan Details" />

          <FormField
            control={form.control}
            name="applicant_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicant Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter full name" 
                    {...field} 
                    className="bg-white dark:bg-gray-950"
                    disabled={selectedClient !== null}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="loan_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-gray-950">
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
                    <Input placeholder="e.g. 10,000,000" {...field} className="bg-white dark:bg-gray-950" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="loan_term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Term (Months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 24" {...field} className="bg-white dark:bg-gray-950" />
                  </FormControl>
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
                    placeholder="Explain why you're applying for this loan" 
                    {...field} 
                    className="min-h-[100px] bg-white dark:bg-gray-950"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSection title="Collateral Information" />
          
          <FormField
            control={form.control}
            name="has_collateral"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>This loan has collateral</FormLabel>
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
                      placeholder="Describe the collateral for this loan" 
                      {...field} 
                      className="min-h-[80px] bg-white dark:bg-gray-950"
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
                    placeholder="Any additional information about this application" 
                    {...field} 
                    className="min-h-[80px] bg-white dark:bg-gray-950"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="terms_accepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I accept the terms and conditions</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-purple-700 hover:bg-purple-800" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Loan Application"
            )}
          </Button>
          
          {loanApplicationId && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
              <p className="font-medium">Application submitted successfully!</p>
              <p className="text-sm mt-1">Click the "Supporting Documents" tab above to upload required documents.</p>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};
