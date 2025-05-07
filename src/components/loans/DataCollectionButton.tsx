
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  // Client details
  clientName: z.string().min(3, { message: "Client name must be at least 3 characters" }),
  nationalId: z.string().min(5, { message: "Valid National ID required" }),
  phoneNumber: z.string().min(10, { message: "Valid phone number required" }),
  loanPurpose: z.string().min(10, { message: "Loan purpose must be detailed" }),
  loanAmount: z.string().min(1, { message: "Loan amount required" }),
  income: z.string().min(1, { message: "Monthly income required" }),
  address: z.string().min(5, { message: "Address required" }),
  notes: z.string().optional(),
  
  // First guarantor
  guarantor1Name: z.string().min(3, { message: "Guarantor name required" }),
  guarantor1NationalId: z.string().min(5, { message: "Valid National ID required" }),
  guarantor1Phone: z.string().min(10, { message: "Valid phone number required" }),
  guarantor1Relation: z.string().min(2, { message: "Relationship required" }),
  guarantor1Address: z.string().min(5, { message: "Address required" }),
  guarantor1Commitment: z.string().min(5, { message: "Commitment details required" }),
  
  // Second guarantor
  guarantor2Name: z.string().min(3, { message: "Guarantor name required" }),
  guarantor2NationalId: z.string().min(5, { message: "Valid National ID required" }),
  guarantor2Phone: z.string().min(10, { message: "Valid phone number required" }),
  guarantor2Relation: z.string().min(2, { message: "Relationship required" }),
  guarantor2Address: z.string().min(5, { message: "Address required" }),
  guarantor2Commitment: z.string().min(5, { message: "Commitment details required" }),
});

const DataCollectionButton = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      nationalId: "",
      phoneNumber: "",
      loanPurpose: "",
      loanAmount: "",
      income: "",
      address: "",
      notes: "",
      guarantor1Name: "",
      guarantor1NationalId: "",
      guarantor1Phone: "",
      guarantor1Relation: "",
      guarantor1Address: "",
      guarantor1Commitment: "",
      guarantor2Name: "",
      guarantor2NationalId: "",
      guarantor2Phone: "",
      guarantor2Relation: "",
      guarantor2Address: "",
      guarantor2Commitment: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Client data collected",
      description: "The client information and guarantor details have been saved successfully.",
    });
    console.log(values);
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-purple-700 hover:bg-purple-800 flex gap-2">
          <ClipboardList size={18} />
          Collect Client Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Onboarding Form</DialogTitle>
          <DialogDescription>
            Collect client information and guarantor details for loan applications and due diligence process.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="client">Client Details</TabsTrigger>
                <TabsTrigger value="guarantor1">First Guarantor</TabsTrigger>
                <TabsTrigger value="guarantor2">Second Guarantor</TabsTrigger>
              </TabsList>
              
              {/* Client Details Tab */}
              <TabsContent value="client" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="NIN12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+256 700 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount (UGX)</FormLabel>
                        <FormControl>
                          <Input placeholder="5,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (UGX)</FormLabel>
                        <FormControl>
                          <Input placeholder="1,500,000" {...field} />
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
                        <FormLabel>Residential Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Plot 123, Example Road, Kampala" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="loanPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe how the loan will be used" 
                          className="h-20"
                          {...field} 
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
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about the client or application" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Add any relevant information for the due diligence process
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* First Guarantor Tab */}
              <TabsContent value="guarantor1" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guarantor1Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guarantor Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guarantor1NationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="NIN12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guarantor1Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+256 700 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guarantor1Relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Client</FormLabel>
                        <FormControl>
                          <Input placeholder="Family member, colleague, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="guarantor1Address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Plot 123, Example Road, Kampala" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guarantor1Commitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commitment Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detail the guarantor's commitment and obligations" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Specify what the guarantor is committing to in relation to this loan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Second Guarantor Tab */}
              <TabsContent value="guarantor2" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guarantor2Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guarantor Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guarantor2NationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="NIN12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guarantor2Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+256 700 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guarantor2Relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Client</FormLabel>
                        <FormControl>
                          <Input placeholder="Family member, colleague, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="guarantor2Address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Plot 123, Example Road, Kampala" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guarantor2Commitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commitment Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detail the guarantor's commitment and obligations" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Specify what the guarantor is committing to in relation to this loan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800">Submit Application</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DataCollectionButton;
