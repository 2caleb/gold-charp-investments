
import React from 'react';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { Client } from '@/types/schema';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const loanApplicationSchema = z.object({
  client_id: z.string().uuid("Please select a client"),
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
  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
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
    },
  });

  const hasCollateral = form.watch("has_collateral");

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
          <FormSection title="Applicant Information" />
            
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
                          {client.full_name}
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
          
          <FormField
            control={form.control}
            name="applicant_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} className="bg-white dark:bg-gray-950" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSection title="Loan Details" />

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
