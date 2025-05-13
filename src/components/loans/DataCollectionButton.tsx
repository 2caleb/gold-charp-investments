
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Printer, ClipboardList, FileUp, Camera, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define the form schema
const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  idNumber: z.string().min(5, "ID number is required"),
  address: z.string().min(5, "Address is required"),
  loanType: z.string().min(1, "Please select a loan type"),
  loanAmount: z.string().min(1, "Loan amount is required"),
  purposeOfLoan: z.string().min(10, "Please provide more details about the purpose"),
  employmentStatus: z.string().min(1, "Please select employment status"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  notes: z.string().optional(),
});

// Create a type from the schema
type FormValues = z.infer<typeof formSchema>;

const DataCollectionButton = () => {
  const [open, setOpen] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [formComplete, setFormComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      phoneNumber: "",
      idNumber: "",
      address: "",
      loanType: "",
      loanAmount: "",
      purposeOfLoan: "",
      employmentStatus: "",
      monthlyIncome: "",
      notes: "",
    },
  });
  
  // Track form completion progress
  const calculateProgress = (values: any) => {
    const totalFields = Object.keys(formSchema.shape).length;
    const filledFields = Object.entries(values).filter(([key, value]) => {
      // If the field is not notes (which is optional) and has a value
      if (key === 'notes') return true;
      return value && String(value).trim() !== '';
    }).length;
    
    const progress = Math.floor((filledFields / totalFields) * 100);
    setFormProgress(progress);
    setFormComplete(progress === 100);
    
    return progress;
  };
  
  // Watch form values to update progress
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      calculateProgress(values);
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit client data.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 1. Insert the loan application into the database
      const { data: applicationData, error: applicationError } = await supabase
        .from('loan_applications')
        .insert({
          client_name: values.clientName,
          phone_number: values.phoneNumber,
          id_number: values.idNumber,
          address: values.address,
          loan_type: values.loanType,
          loan_amount: values.loanAmount,
          purpose_of_loan: values.purposeOfLoan,
          employment_status: values.employmentStatus,
          monthly_income: values.monthlyIncome,
          notes: values.notes || null,
          created_by: user.id,
          status: 'submitted',
          current_approver: user.id, // Initially set to the submitter
        })
        .select('id')
        .single();
      
      if (applicationError) {
        throw new Error(applicationError.message);
      }
      
      // 2. Trigger the email workflow
      const response = await fetch('https://bjsxekgraxbfqzhbqjff.supabase.co/functions/v1/send-approval-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(({data}) => data.session?.access_token)}`,
        },
        body: JSON.stringify({
          applicationId: applicationData.id,
          action: 'submit'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification email');
      }
      
      // Success notification
      toast({
        title: "Client Data Submitted",
        description: `Successfully collected data for ${values.clientName} and sent for approval.`,
      });
      
      // Close the dialog
      setOpen(false);
      
      // Reset the form
      form.reset();
      setFormProgress(0);
      setFormComplete(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Error",
        description: error.message || "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing",
      description: "Sending document to printer...",
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-300">
        <ClipboardList className="mr-2" size={18} />
        Collect Client Data
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Client Data Collection Form</DialogTitle>
            <DialogDescription>
              Complete all fields in the form to collect client information for loan processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Form Completion</span>
              <span className="text-sm font-medium">{formProgress}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Section */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} className="h-12" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. +1 234 567 8900" {...field} className="h-12" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>National ID / Passport Number</FormLabel>
                            <FormControl>
                              <Input placeholder="ID number" {...field} className="h-12" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Residential Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Full address" {...field} className="min-h-[80px]" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Loan Information Section */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Loan Information</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="loanType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select loan type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mortgage">Mortgage Loan</SelectItem>
                                <SelectItem value="business">Business Loan</SelectItem>
                                <SelectItem value="personal">Personal Loan</SelectItem>
                                <SelectItem value="agricultural">Agricultural Loan</SelectItem>
                                <SelectItem value="education">Education Loan</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="loanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Amount</FormLabel>
                            <FormControl>
                              <Input placeholder="Amount in USD" {...field} className="h-12" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="purposeOfLoan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose of Loan</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how the loan will be used" 
                                {...field} 
                                className="min-h-[80px]" 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Financial Information Section */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Financial Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employed">Employed</SelectItem>
                              <SelectItem value="self-employed">Self-Employed</SelectItem>
                              <SelectItem value="business-owner">Business Owner</SelectItem>
                              <SelectItem value="unemployed">Unemployed</SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income</FormLabel>
                          <FormControl>
                            <Input placeholder="Income in USD" {...field} className="h-12" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Additional Information & Documents */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information..." 
                            {...field} 
                            className="min-h-[120px]" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-6 space-y-4">
                    <h4 className="text-md font-medium">Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-12">
                        <FileUp className="mr-2" size={18} />
                        Upload ID
                      </Button>
                      <Button variant="outline" className="h-12">
                        <FileUp className="mr-2" size={18} />
                        Bank Statements
                      </Button>
                      <Button variant="outline" className="h-12">
                        <Camera className="mr-2" size={18} />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="h-12 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-12 bg-purple-700 hover:bg-purple-800 w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Client Data"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={handlePrint}
                  disabled={!formComplete}
                  className={`h-12 w-full sm:w-auto flex items-center ${!formComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Printer className="mr-2" size={18} />
                  Print Form
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataCollectionButton;
