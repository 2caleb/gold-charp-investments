
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, ArrowRight, ClipboardCheck, FileImage, User as UserIcon, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Form schema definition
const formSchema = z.object({
  // Client details
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  nationalId: z.string().min(5, {
    message: "National ID must be valid.",
  }),
  dateOfBirth: z.string(),
  gender: z.string(),
  maritalStatus: z.string(),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be valid.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  physicalAddress: z.string().min(5, {
    message: "Physical address must be provided.",
  }),
  occupation: z.string().min(2, {
    message: "Occupation must be provided.",
  }),
  incomeSource: z.string().min(2, {
    message: "Income source must be provided.",
  }),
  
  // First guarantor
  guarantor1FullName: z.string().min(2, {
    message: "Guarantor name must be at least 2 characters.",
  }),
  guarantor1NationalId: z.string().min(5, {
    message: "Guarantor National ID must be valid.",
  }),
  guarantor1Relationship: z.string().min(2, {
    message: "Relationship must be provided.",
  }),
  guarantor1PhoneNumber: z.string().min(10, {
    message: "Guarantor phone number must be valid.",
  }),
  guarantor1Address: z.string().min(5, {
    message: "Guarantor address must be provided.",
  }),
  
  // Second guarantor
  guarantor2FullName: z.string().min(2, {
    message: "Guarantor name must be at least 2 characters.",
  }),
  guarantor2NationalId: z.string().min(5, {
    message: "Guarantor National ID must be valid.",
  }),
  guarantor2Relationship: z.string().min(2, {
    message: "Relationship must be provided.",
  }),
  guarantor2PhoneNumber: z.string().min(10, {
    message: "Guarantor phone number must be valid.",
  }),
  guarantor2Address: z.string().min(5, {
    message: "Guarantor address must be provided.",
  }),
  
  // Loan details
  loanPurpose: z.string().min(5, {
    message: "Loan purpose must be provided.",
  }),
  loanAmount: z.string().min(1, {
    message: "Loan amount must be provided.",
  }),
  loanTerm: z.string(),
  
  // Required documents
  hasNationalId: z.boolean().default(false),
  hasProofOfResidence: z.boolean().default(false),
  hasProofOfIncome: z.boolean().default(false),
  hasBankStatements: z.boolean().default(false),
  hasBusinessPlan: z.boolean().default(false),
  hasCollateralDocuments: z.boolean().default(false),
  hasGuarantorDetails: z.boolean().default(false),

  // Disbursement method
  disbursementMethod: z.enum(["mobileMoney", "bankTransfer"]),
  mobileMoney: z.object({
    provider: z.string().optional(),
    number: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  bankTransfer: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    branchCode: z.string().optional(),
  }).optional(),
});

const DataCollectionButton = () => {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("client");
  const [applicationStatus, setApplicationStatus] = useState(20); // Initial status percentage
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Define the application statuses with visual indicators
  const applicationStatuses = [
    { name: "Client Details", step: "client", icon: <UserIcon className="h-4 w-4" />, completed: applicationStatus >= 20 },
    { name: "Guarantors", step: "guarantor1", icon: <User className="h-4 w-4" />, completed: applicationStatus >= 40 },
    { name: "Documentation", step: "media", icon: <FileImage className="h-4 w-4" />, completed: applicationStatus >= 80 },
    { name: "Review", step: "review", icon: <ClipboardCheck className="h-4 w-4" />, completed: applicationStatus >= 100 },
    { name: "Submit", step: "submit", icon: <Send className="h-4 w-4" />, completed: applicationStatus >= 100 },
  ];
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Default values for the form
      fullName: "",
      nationalId: "",
      dateOfBirth: "",
      gender: "male",
      maritalStatus: "single",
      phoneNumber: "",
      email: "",
      physicalAddress: "",
      occupation: "",
      incomeSource: "",
      
      guarantor1FullName: "",
      guarantor1NationalId: "",
      guarantor1Relationship: "",
      guarantor1PhoneNumber: "",
      guarantor1Address: "",
      
      guarantor2FullName: "",
      guarantor2NationalId: "",
      guarantor2Relationship: "",
      guarantor2PhoneNumber: "",
      guarantor2Address: "",
      
      loanPurpose: "",
      loanAmount: "",
      loanTerm: "12",
      
      hasNationalId: false,
      hasProofOfResidence: false,
      hasProofOfIncome: false,
      hasBankStatements: false,
      hasBusinessPlan: false,
      hasCollateralDocuments: false,
      hasGuarantorDetails: false,

      disbursementMethod: "mobileMoney",
    },
  });

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to submit client data.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Form values:", values);
      
      // In a real application, you would submit this data to your backend or Supabase
      toast({
        title: "Client information collected",
        description: "The information has been submitted and sent for manager review.",
      });
      
      // Close the dialog and redirect to the dashboard
      setOpen(false);
      
      // Navigate to the dashboard after submission
      navigate('/staff/data-collection');
      
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred while submitting the form.",
        variant: "destructive",
      });
    }
  };

  // Required documents list with descriptions
  const requiredDocuments = [
    {
      id: "hasNationalId",
      label: "National ID",
      description: "Valid government-issued ID such as National ID, Passport, or Driver's License"
    },
    {
      id: "hasProofOfResidence",
      label: "Proof of Residence",
      description: "Utility bill, rental agreement, or local council letter not older than 3 months"
    },
    {
      id: "hasProofOfIncome",
      label: "Proof of Income",
      description: "Recent pay slips, tax returns, or bank statements showing income for the past 3 months"
    },
    {
      id: "hasBankStatements",
      label: "Bank Statements",
      description: "Last 6 months of bank statements showing transaction history"
    },
    {
      id: "hasBusinessPlan",
      label: "Business Plan/Proposal",
      description: "Detailed plan for business loans explaining how funds will be used and repayment strategy"
    },
    {
      id: "hasCollateralDocuments",
      label: "Collateral Documents",
      description: "Property deeds, vehicle titles, or other assets being used as collateral"
    },
    {
      id: "hasGuarantorDetails",
      label: "Guarantor Documents",
      description: "IDs and proof of income for guarantors"
    }
  ];

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    
    // Update progress based on tab
    switch(tab) {
      case "client":
        setApplicationStatus(20);
        break;
      case "guarantor1":
      case "guarantor2":
        setApplicationStatus(40);
        break;
      case "media":
        setApplicationStatus(80);
        break;
      case "review":
        setApplicationStatus(100);
        break;
    }
  };

  // Visual onboarding process
  const OnboardingProcess = () => (
    <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="mb-2">
        <h4 className="text-sm font-medium mb-1">Client Onboarding Process</h4>
        <Progress value={applicationStatus} className="h-2" />
      </div>
      
      <div className="mt-4 grid grid-cols-5 gap-1 text-center">
        {applicationStatuses.map((status, index) => (
          <div 
            key={index} 
            className={`text-xs p-2 rounded flex flex-col items-center justify-center transition-all duration-300 
              ${status.completed 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'}`}
          >
            <div className={`rounded-full p-1 mb-1 ${status.completed 
              ? 'bg-purple-200 dark:bg-purple-800' 
              : 'bg-gray-200 dark:bg-gray-600'}`}>
              {status.icon}
            </div>
            <span>{status.name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Field Officer</span>
          <ArrowRight size={12} className="text-gray-400" />
          <span>Manager</span>
          <ArrowRight size={12} className="text-gray-400" />
          <span>Director</span>
          <ArrowRight size={12} className="text-gray-400" />
          <span>CEO</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-300 hover:scale-105">
          Collect Client Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Client Data Collection</DialogTitle>
          <DialogDescription>
            Collect all necessary client information for loan application processing.
          </DialogDescription>
        </DialogHeader>
        
        {/* Onboarding Process Visualization */}
        <OnboardingProcess />
        
        <ScrollArea className="flex-grow pr-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <Tabs defaultValue="client" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="client" className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" /> Client
                </TabsTrigger>
                <TabsTrigger value="guarantor1" className="flex items-center gap-1">
                  <User className="h-4 w-4" /> Guarantor 1
                </TabsTrigger>
                <TabsTrigger value="guarantor2" className="flex items-center gap-1">
                  <User className="h-4 w-4" /> Guarantor 2
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-1">
                  <FileImage className="h-4 w-4" /> Documents
                </TabsTrigger>
                <TabsTrigger value="review" className="flex items-center gap-1">
                  <ClipboardCheck className="h-4 w-4" /> Review
                </TabsTrigger>
              </TabsList>
              
              {/* Client Details Tab */}
              <TabsContent value="client" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="personal-info">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Personal Information</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input 
                            id="fullName" 
                            {...form.register("fullName")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.fullName && (
                            <p className="text-red-500 text-xs">{form.formState.errors.fullName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="nationalId">National ID</Label>
                          <Input 
                            id="nationalId" 
                            {...form.register("nationalId")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.nationalId && (
                            <p className="text-red-500 text-xs">{form.formState.errors.nationalId.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input 
                            id="dateOfBirth" 
                            type="date" 
                            {...form.register("dateOfBirth")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select 
                            onValueChange={(value) => form.setValue("gender", value)}
                            defaultValue={form.getValues("gender")}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus">Marital Status</Label>
                          <Select 
                            onValueChange={(value) => form.setValue("maritalStatus", value)}
                            defaultValue={form.getValues("maritalStatus")}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                              <SelectValue placeholder="Select Marital Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="contact-info">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Contact Information</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input 
                            id="phoneNumber" 
                            {...form.register("phoneNumber")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.phoneNumber && (
                            <p className="text-red-500 text-xs">{form.formState.errors.phoneNumber.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            {...form.register("email")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.email && (
                            <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="physicalAddress">Physical Address</Label>
                          <Textarea 
                            id="physicalAddress" 
                            {...form.register("physicalAddress")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.physicalAddress && (
                            <p className="text-red-500 text-xs">{form.formState.errors.physicalAddress.message}</p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="financial-info">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Financial Information</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input 
                            id="occupation" 
                            {...form.register("occupation")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.occupation && (
                            <p className="text-red-500 text-xs">{form.formState.errors.occupation.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="incomeSource">Income Source</Label>
                          <Input 
                            id="incomeSource" 
                            {...form.register("incomeSource")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.incomeSource && (
                            <p className="text-red-500 text-xs">{form.formState.errors.incomeSource.message}</p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="loan-details">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Loan Details</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="loanPurpose">Loan Purpose</Label>
                          <Textarea 
                            id="loanPurpose" 
                            {...form.register("loanPurpose")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                            placeholder="Please describe what the loan will be used for"
                          />
                          {form.formState.errors.loanPurpose && (
                            <p className="text-red-500 text-xs">{form.formState.errors.loanPurpose.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="loanAmount">Loan Amount (UGX)</Label>
                          <Input 
                            id="loanAmount" 
                            type="number" 
                            {...form.register("loanAmount")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.loanAmount && (
                            <p className="text-red-500 text-xs">{form.formState.errors.loanAmount.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="loanTerm">Loan Term (Months)</Label>
                          <Select 
                            onValueChange={(value) => form.setValue("loanTerm", value)}
                            defaultValue={form.getValues("loanTerm")}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                              <SelectValue placeholder="Select Loan Term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 Months</SelectItem>
                              <SelectItem value="6">6 Months</SelectItem>
                              <SelectItem value="12">12 Months</SelectItem>
                              <SelectItem value="24">24 Months</SelectItem>
                              <SelectItem value="36">36 Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* First Guarantor Tab */}
              <TabsContent value="guarantor1" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="guarantor-personal">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Guarantor Information</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guarantor1FullName">Full Name</Label>
                          <Input 
                            id="guarantor1FullName" 
                            {...form.register("guarantor1FullName")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.guarantor1FullName && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor1FullName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guarantor1NationalId">National ID</Label>
                          <Input 
                            id="guarantor1NationalId" 
                            {...form.register("guarantor1NationalId")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.guarantor1NationalId && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor1NationalId.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guarantor1Relationship">Relationship to Applicant</Label>
                          <Input 
                            id="guarantor1Relationship" 
                            {...form.register("guarantor1Relationship")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.guarantor1Relationship && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor1Relationship.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guarantor1PhoneNumber">Phone Number</Label>
                          <Input 
                            id="guarantor1PhoneNumber" 
                            {...form.register("guarantor1PhoneNumber")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.guarantor1PhoneNumber && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor1PhoneNumber.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="guarantor1Address">Physical Address</Label>
                          <Input 
                            id="guarantor1Address" 
                            {...form.register("guarantor1Address")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.guarantor1Address && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor1Address.message}</p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Second Guarantor Tab */}
              <TabsContent value="guarantor2" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="guarantor-personal">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Guarantor Information</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guarantor2FullName">Full Name</Label>
                          <Input 
                            id="guarantor2FullName" 
                            {...form.register("guarantor2FullName")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.guarantor2FullName && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor2FullName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guarantor2NationalId">National ID</Label>
                          <Input 
                            id="guarantor2NationalId" 
                            {...form.register("guarantor2NationalId")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.guarantor2NationalId && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor2NationalId.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guarantor2Relationship">Relationship to Applicant</Label>
                          <Input 
                            id="guarantor2Relationship" 
                            {...form.register("guarantor2Relationship")} 
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                          />
                          {form.formState.errors.guarantor2Relationship && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor2Relationship.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guarantor2PhoneNumber">Phone Number</Label>
                          <Input 
                            id="guarantor2PhoneNumber" 
                            {...form.register("guarantor2PhoneNumber")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.guarantor2PhoneNumber && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor2PhoneNumber.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="guarantor2Address">Physical Address</Label>
                          <Input 
                            id="guarantor2Address" 
                            {...form.register("guarantor2Address")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-500" 
                          />
                          {form.formState.errors.guarantor2Address && (
                            <p className="text-red-500 text-xs">{form.formState.errors.guarantor2Address.message}</p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Documentation Tab */}
              <TabsContent value="media" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="required-documents">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Required Documents</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          The following documents are required for loan application processing:
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <Form {...form}>
                            {requiredDocuments.map((doc) => (
                              <FormField
                                key={doc.id}
                                control={form.control}
                                name={doc.id as any}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-purple-600"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="font-medium">{doc.label}</FormLabel>
                                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                        {doc.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </Form>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="disbursement-info">
                    <AccordionTrigger className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Disbursement Method</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-4">
                        <Form {...form}>
                          <FormField
                            control={form.control}
                            name="disbursementMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Disbursement Method</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mobileMoney">Mobile Money</SelectItem>
                                    <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </Form>
                        
                        {form.watch("disbursementMethod") === "mobileMoney" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                            <div className="space-y-2">
                              <Label htmlFor="mobileMoneyProvider">Mobile Money Provider</Label>
                              <Select 
                                onValueChange={(value) => form.setValue("mobileMoney.provider", value)}
                              >
                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                                  <SelectValue placeholder="Select Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                                  <SelectItem value="airtel">Airtel Money</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="mobileMoneyNumber">Mobile Money Number</Label>
                              <Input 
                                id="mobileMoneyNumber" 
                                onChange={(e) => form.setValue("mobileMoney.number", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="mobileMoneyName">Account Holder Name</Label>
                              <Input 
                                id="mobileMoneyName" 
                                onChange={(e) => form.setValue("mobileMoney.name", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        )}
                        
                        {form.watch("disbursementMethod") === "bankTransfer" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                            <div className="space-y-2">
                              <Label htmlFor="bankName">Bank Name</Label>
                              <Select 
                                onValueChange={(value) => form.setValue("bankTransfer.bankName", value)}
                              >
                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                                  <SelectValue placeholder="Select Bank" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                                  <SelectItem value="centenary">Centenary Bank</SelectItem>
                                  <SelectItem value="dfcu">DFCU Bank</SelectItem>
                                  <SelectItem value="equity">Equity Bank</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="accountNumber">Account Number</Label>
                              <Input 
                                id="accountNumber" 
                                onChange={(e) => form.setValue("bankTransfer.accountNumber", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="accountName">Account Holder Name</Label>
                              <Input 
                                id="accountName" 
                                onChange={(e) => form.setValue("bankTransfer.accountName", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="branchCode">Branch Code (Optional)</Label>
                              <Input 
                                id="branchCode" 
                                onChange={(e) => form.setValue("bankTransfer.branchCode", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Review & Submit Tab */}
              <TabsContent value="review" className="space-y-4">
                <div className="space-y-6">
                  <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4">
                    <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-400 flex items-center">
                      <ClipboardCheck className="mr-2" size={20} /> Application Summary
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Please review all the information before submitting your application. After submission:
                    </p>
                    
                    {/* Workflow visualization */}
                    <div className="mb-6 p-3 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                      <h4 className="font-medium text-sm mb-3">Approval Workflow</h4>
                      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0">
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-xs mt-1">Field Officer</span>
                          <span className="text-xs text-purple-600 dark:text-purple-400">Submission</span>
                        </div>
                        
                        <ArrowRight className="hidden md:block mx-2 text-gray-400" />
                        
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-xs mt-1">Manager</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">Initial Review</span>
                        </div>
                        
                        <ArrowRight className="hidden md:block mx-2 text-gray-400" />
                        
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs mt-1">Director</span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400">Due Diligence</span>
                        </div>
                        
                        <ArrowRight className="hidden md:block mx-2 text-gray-400" />
                        
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs mt-1">CEO</span>
                          <span className="text-xs text-green-600 dark:text-green-400">Final Approval</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Client Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500 dark:text-gray-400">Full Name:</div>
                          <div>{form.getValues("fullName") || "Not provided"}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">National ID:</div>
                          <div>{form.getValues("nationalId") || "Not provided"}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Phone:</div>
                          <div>{form.getValues("phoneNumber") || "Not provided"}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Email:</div>
                          <div>{form.getValues("email") || "Not provided"}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Loan Amount:</div>
                          <div>{form.getValues("loanAmount") ? `UGX ${form.getValues("loanAmount")}` : "Not provided"}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Loan Term:</div>
                          <div>{form.getValues("loanTerm") ? `${form.getValues("loanTerm")} months` : "Not provided"}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Disbursement Method:</div>
                          <div>{form.getValues("disbursementMethod") === "mobileMoney" ? "Mobile Money" : "Bank Transfer"}</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Document Status</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {requiredDocuments.map((doc) => (
                            <React.Fragment key={doc.id}>
                              <div className="text-gray-500 dark:text-gray-400">{doc.label}:</div>
                              <div className={form.getValues(doc.id as any) ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                                {form.getValues(doc.id as any) ? "Provided" : "Missing"}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md">
                      <p className="font-medium mb-1 text-yellow-700 dark:text-yellow-400">What happens next?</p>
                      <ol className="list-decimal pl-5 space-y-1 text-yellow-800 dark:text-yellow-300">
                        <li>Your application will be reviewed by a manager within 1-2 business days</li>
                        <li>The application will then go to a director for due diligence assessment</li>
                        <li>Final approval is granted by the CEO</li>
                        <li>You will receive updates on each step of the process</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="transition-all duration-300 hover:bg-gray-100">
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-300 hover:shadow-md">
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataCollectionButton;
