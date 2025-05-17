import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoanApplication, LoanDetailsFormProps } from '@/types/loan';
import { dataCollectionFormSchema, DataCollectionFormValues } from './data-collection/schema';
import { supabase } from '@/integrations/supabase/client';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

const LoanDetailsForm = ({
  loanApplication,
  isUpdateMode = false,
  onSubmit: submitHandler,
  isSubmitting: isSubmittingProp = false,
  clients,
  isLoadingClients,
  preselectedClientId
}: LoanDetailsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(isSubmittingProp);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generatedLoanId, setGeneratedLoanId] = useState(generateLoanIdentificationNumber());

  const form = useForm<DataCollectionFormValues>({
    resolver: zodResolver(dataCollectionFormSchema),
    defaultValues: {
      client_type: loanApplication ? 'existing' : 'new',
      full_name: loanApplication?.client_name || "",
      phone_number: loanApplication?.client_phone || "",
      address: loanApplication?.client_address || "",
      id_number: loanApplication?.client_id_number || "",
      employment_status: loanApplication?.client_employment_status || "employed",
      monthly_income: loanApplication?.client_monthly_income || "",
      loan_amount: loanApplication?.loan_amount || "",
      loan_type: loanApplication?.loan_type || "",
      loan_term: loanApplication?.loan_term || "",
      term_unit: loanApplication?.term_unit || "monthly",
      guarantor1_name: loanApplication?.guarantor1_name || "",
      guarantor1_phone: loanApplication?.guarantor1_phone || "",
      guarantor1_id_number: loanApplication?.guarantor1_id_number || "",
      guarantor1_consent: loanApplication?.guarantor1_consent || false,
      guarantor2_name: loanApplication?.guarantor2_name || "",
      guarantor2_phone: loanApplication?.guarantor2_phone || "",
      guarantor2_id_number: loanApplication?.guarantor2_id_number || "",
      guarantor2_consent: loanApplication?.guarantor2_consent || false,
      purpose_of_loan: loanApplication?.purpose_of_loan || "",
      terms_accepted: loanApplication?.terms_accepted || false,
      client_id: loanApplication?.client_id || "",
      email: loanApplication?.client_email || "",
      has_collateral: loanApplication?.has_collateral || false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (loanApplication) {
      form.reset({
        client_type: loanApplication ? 'existing' : 'new',
        full_name: loanApplication?.client_name || "",
        phone_number: loanApplication?.client_phone || "",
        address: loanApplication?.client_address || "",
        id_number: loanApplication?.client_id_number || "",
        employment_status: loanApplication?.client_employment_status || "employed",
        monthly_income: loanApplication?.client_monthly_income || "",
        loan_amount: loanApplication?.loan_amount || "",
        loan_type: loanApplication?.loan_type || "",
        loan_term: loanApplication?.loan_term || "",
        term_unit: loanApplication?.term_unit || "monthly",
        guarantor1_name: loanApplication?.guarantor1_name || "",
        guarantor1_phone: loanApplication?.guarantor1_phone || "",
        guarantor1_id_number: loanApplication?.guarantor1_id_number || "",
        guarantor1_consent: loanApplication?.guarantor1_consent || false,
        guarantor2_name: loanApplication?.guarantor2_name || "",
        guarantor2_phone: loanApplication?.guarantor2_phone || "",
        guarantor2_id_number: loanApplication?.guarantor2_id_number || "",
        guarantor2_consent: loanApplication?.guarantor2_consent || false,
        purpose_of_loan: loanApplication?.purpose_of_loan || "",
        terms_accepted: loanApplication?.terms_accepted || false,
        client_id: loanApplication?.client_id || "",
        email: loanApplication?.client_email || "",
        has_collateral: loanApplication?.has_collateral || false,
      });
    }
  }, [loanApplication, form]);

  const onSubmit = async (values: DataCollectionFormValues) => {
    if (submitHandler) {
      submitHandler(values);
      return;
    }
    
    setIsSubmitting(true);

    const loanApplicationData = {
      client_type: values.client_type,
      loan_type: values.loan_type,
      loan_amount: values.loan_amount,
      loan_term: values.loan_term,
      term_unit: values.term_unit,
      purpose_of_loan: values.purpose_of_loan,
      has_collateral: values.has_collateral || false,
      
      // Client fields
      full_name: values.full_name,
      phone_number: values.phone_number,
      id_number: values.id_number,
      address: values.address,
      employment_status: values.employment_status || 'employed',
      monthly_income: values.monthly_income,
      email: values.email,
      
      // Guarantor fields
      guarantor1_name: values.guarantor1_name,
      guarantor1_phone: values.guarantor1_phone,
      guarantor1_id_number: values.guarantor1_id_number,
      guarantor1_consent: values.guarantor1_consent,
      guarantor2_name: values.guarantor2_name,
      guarantor2_phone: values.guarantor2_phone,
      guarantor2_id_number: values.guarantor2_id_number,
      guarantor2_consent: values.guarantor2_consent,
      
      // Terms
      terms_accepted: values.terms_accepted,
    };

    try {
      if (isUpdateMode && loanApplication) {
        // Update existing loan application
        const { data, error } = await supabase
          .from('loan_applications')
          .update({
            loan_type: values.loan_type,
            loan_amount: values.loan_amount,
            purpose_of_loan: values.purpose_of_loan,
            client_name: values.full_name,
            phone_number: values.phone_number,
            address: values.address,
            id_number: values.id_number,
            employment_status: values.employment_status,
            monthly_income: values.monthly_income,
            notes: values.purpose_of_loan
          })
          .eq('id', loanApplication.id);

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Loan Application Updated",
          description: "The loan application has been successfully updated.",
        });
      } else {
        // Create new loan application
        const { data: clientData, error: clientError } = await supabase
          .from('client_name')
          .insert({
            full_name: values.full_name,
            phone_number: values.phone_number,
            email: values.email,
            id_number: values.id_number,
            address: values.address,
            employment_status: values.employment_status,
            monthly_income: parseFloat(values.monthly_income || '0'),
          })
          .select();

        if (clientError) {
          throw new Error(clientError.message);
        }

        const newClientId = clientData?.[0]?.id;

        const { data, error } = await supabase
          .from('loan_applications')
          .insert({
            loan_type: values.loan_type,
            loan_amount: values.loan_amount,
            purpose_of_loan: values.purpose_of_loan,
            loan_id: generatedLoanId,
            client_name: values.full_name,
            phone_number: values.phone_number,
            address: values.address,
            id_number: values.id_number,
            employment_status: values.employment_status,
            monthly_income: values.monthly_income,
            notes: values.purpose_of_loan,
            created_by: '00000000-0000-0000-0000-000000000000', // This should be replaced with actual user ID
            current_approver: '00000000-0000-0000-0000-000000000000', // This should be replaced with actual approver ID
            status: 'submitted'
          })
          .select();

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Loan Application Created",
          description: "The loan application has been successfully created.",
        });
      }

      navigate('/loan-applications');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isUpdateMode ? "Edit Loan Application" : "New Loan Application"}</CardTitle>
        <CardDescription>Fill in the details for the loan application.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client type" />
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
                        <SelectItem value="mortgage">Mortgage Loan</SelectItem>
                        <SelectItem value="business">Business Loan</SelectItem>
                        <SelectItem value="education">Education Loan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loan_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="Loan amount" {...field} />
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
                    <FormLabel>Loan Term</FormLabel>
                    <FormControl>
                      <Input placeholder="Loan term" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
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
                      <Input placeholder="Purpose of loan" {...field} />
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Has Collateral</FormLabel>
                    <FormDescription>
                      Check if the loan has collateral.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <h3 className="text-xl font-semibold mt-4">Client Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
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
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="ID number" {...field} />
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
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <FormControl>
                      <Input placeholder="Employment status" {...field} />
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
                      <Input placeholder="Monthly income" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-xl font-semibold mt-4">Guarantor 1 Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guarantor1_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarantor 1 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Guarantor 1 name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guarantor1_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarantor 1 Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Guarantor 1 phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guarantor1_id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarantor 1 ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Guarantor 1 ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guarantor1_consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Guarantor 1 Consent</FormLabel>
                      <FormDescription>
                        Confirm that guarantor 1 has consented to be a guarantor.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-xl font-semibold mt-4">Guarantor 2 Information (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guarantor2_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarantor 2 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Guarantor 2 name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guarantor2_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarantor 2 Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Guarantor 2 phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guarantor2_id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarantor 2 ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Guarantor 2 ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guarantor2_consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Guarantor 2 Consent</FormLabel>
                      <FormDescription>
                        Confirm that guarantor 2 has consented to be a guarantor.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terms_accepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Terms and Conditions</FormLabel>
                    <FormDescription>
                      I agree to the terms and conditions.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : (isUpdateMode ? "Update Application" : "Submit Application")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoanDetailsForm;
