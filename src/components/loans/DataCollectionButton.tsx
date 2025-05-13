import React, { useState, useRef } from 'react';
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
import { 
  User, 
  ArrowRight, 
  ClipboardCheck, 
  FileImage, 
  User as UserIcon, 
  Send, 
  Camera, 
  Video, 
  Upload, 
  MessageSquare,
  Star,
  StarHalf,
  Clock,
  CheckCircle,
  XCircle,
  FileScan
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Form schema definition with additional fields for document scanning and application rating
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
  
  // New fields for application rating and approval
  applicationRating: z.number().min(1).max(5).optional(),
  applicationNotes: z.string().optional(),
  applicationStatus: z.enum(["pending", "approved", "disapproved"]).default("pending"),
});

const DataCollectionButton = () => {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("client");
  const [applicationStatus, setApplicationStatus] = useState(20); // Initial status percentage
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // New state for media handling
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [capturedVideos, setCapturedVideos] = useState<string[]>([]);
  const [scannedDocuments, setScannedDocuments] = useState<{id: string, name: string, url: string}[]>([]);
  const [messages, setMessages] = useState<{sender: string, message: string, timestamp: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCapturing, setIsCapturing] = useState<'photo' | 'video' | 'scan' | null>(null);
  
  // Refs for media capture
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Define the application statuses with visual indicators
  const applicationStatuses = [
    { name: "Client Details", step: "client", icon: <UserIcon className="h-4 w-4" />, completed: applicationStatus >= 20 },
    { name: "Guarantors", step: "guarantor1", icon: <User className="h-4 w-4" />, completed: applicationStatus >= 40 },
    { name: "Documentation", step: "media", icon: <FileImage className="h-4 w-4" />, completed: applicationStatus >= 60 },
    { name: "Site Visit", step: "siteVisit", icon: <Camera className="h-4 w-4" />, completed: applicationStatus >= 80 },
    { name: "Review", step: "review", icon: <ClipboardCheck className="h-4 w-4" />, completed: applicationStatus >= 100 },
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
      
      // Default for new fields
      applicationRating: 3,
      applicationNotes: "",
      applicationStatus: "pending",
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
      
      // Calculate completeness score for documents
      const requiredDocs = [
        values.hasNationalId,
        values.hasProofOfResidence, 
        values.hasProofOfIncome,
        values.hasBankStatements,
        values.hasBusinessPlan,
        values.hasCollateralDocuments,
        values.hasGuarantorDetails
      ];
      
      const completedDocs = requiredDocs.filter(Boolean).length;
      const totalDocs = requiredDocs.length;
      const completenessScore = Math.round((completedDocs / totalDocs) * 100);
      
      // Auto-determine application status based on documents and rating
      let finalStatus = values.applicationStatus;
      if (completenessScore < 50) {
        finalStatus = "disapproved";
        form.setValue("applicationStatus", "disapproved");
      } else if (values.applicationRating && values.applicationRating >= 4 && completenessScore >= 80) {
        finalStatus = "approved";
        form.setValue("applicationStatus", "approved");
      }
      
      // In a real application, you would submit this data to your backend or Supabase
      toast({
        title: "Client information collected",
        description: `The information has been submitted with status: ${finalStatus.toUpperCase()}`,
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
        setApplicationStatus(60);
        break;
      case "siteVisit":
        setApplicationStatus(80);
        break;
      case "review":
        setApplicationStatus(100);
        break;
    }
  };
  
  // Handle photo capture
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setCapturedPhotos([...capturedPhotos, event.target.result as string]);
          
          toast({
            title: "Photo captured",
            description: `Photo added to client documentation.`,
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
    setIsCapturing(null);
  };
  
  // Handle video capture
  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setCapturedVideos([...capturedVideos, event.target.result as string]);
          
          toast({
            title: "Video captured",
            description: `Video added to client documentation.`,
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
    setIsCapturing(null);
  };
  
  // Handle document scanning
  const handleDocumentScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const newDoc = {
            id: `doc-${Date.now()}`,
            name: file.name,
            url: event.target.result as string
          };
          
          setScannedDocuments([...scannedDocuments, newDoc]);
          
          toast({
            title: "Document scanned",
            description: `${file.name} added to client documentation.`,
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
    setIsCapturing(null);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      sender: "Field Officer",
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Scroll to bottom of messages
    setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
    
    // Simulate reply from manager after 2 seconds
    setTimeout(() => {
      const replyMsg = {
        sender: "Manager",
        message: "Thanks for the update. Please make sure to verify the client's income source.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, replyMsg]);
      
      // Scroll to bottom again
      setTimeout(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }, 2000);
  };
  
  // Trigger file input click for media capture
  const triggerCapture = (type: 'photo' | 'video' | 'scan') => {
    setIsCapturing(type);
    
    setTimeout(() => {
      if (type === 'photo' && photoInputRef.current) {
        photoInputRef.current.click();
      } else if (type === 'video' && videoInputRef.current) {
        videoInputRef.current.click();
      } else if (type === 'scan' && scanInputRef.current) {
        scanInputRef.current.click();
      }
    }, 100);
  };
  
  // Get formatted rating stars
  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-5 h-5 text-yellow-500 fill-yellow-500" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 text-yellow-500 fill-yellow-500" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }
    
    return stars;
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
  
  // Hidden file inputs for media capture
  const MediaInputs = () => (
    <div className="hidden">
      <input 
        type="file" 
        ref={photoInputRef}
        accept="image/*" 
        capture="environment"
        onChange={handlePhotoCapture}
      />
      <input 
        type="file" 
        ref={videoInputRef}
        accept="video/*" 
        capture="environment"
        onChange={handleVideoCapture}
      />
      <input 
        type="file" 
        ref={scanInputRef}
        accept="image/*" 
        onChange={handleDocumentScan}
      />
    </div>
  );

  return (
    <>
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
                  <TabsTrigger value="siteVisit" className="flex items-center gap-1">
                    <Camera className="h-4 w-4" /> Site Visit
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
