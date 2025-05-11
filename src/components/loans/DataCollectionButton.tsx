import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Camera, Video, Upload, Scan, Check, X, ChevronDown, ChevronUp, Shield, Users, ShieldCheck, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  // Fields for approval and documentation
  applicationStatus: z.enum(["pending", "approved", "disapproved"]),
  applicationRating: z.enum(["complete", "incomplete"]),
  fieldNotes: z.string().optional(),
  managerFeedback: z.string().optional(),
  
  // New authorization level field
  authorizationLevel: z.enum(["field_officer", "manager", "director", "ceo"]).default("field_officer"),
});

type AuthLevel = {
  name: string;
  value: z.infer<typeof formSchema>["authorizationLevel"];
  icon: React.ReactNode;
  description: string;
  canEdit: string[];
  canApprove: boolean;
  canDisapprove: boolean;
  canSendToHigherLevel: boolean;
  color: string;
};

const authorizationLevels: AuthLevel[] = [
  {
    name: "Field Officer",
    value: "field_officer",
    icon: <Users size={16} />,
    description: "Can collect data and submit for review",
    canEdit: ["clientName", "nationalId", "phoneNumber", "loanPurpose", "loanAmount", "income", "address", "notes", 
              "guarantor1Name", "guarantor1NationalId", "guarantor1Phone", "guarantor1Relation", "guarantor1Address", "guarantor1Commitment", 
              "guarantor2Name", "guarantor2NationalId", "guarantor2Phone", "guarantor2Relation", "guarantor2Address", "guarantor2Commitment",
              "fieldNotes", "applicationRating"],
    canApprove: false,
    canDisapprove: false,
    canSendToHigherLevel: true,
    color: "text-blue-600 bg-blue-100"
  },
  {
    name: "Manager",
    value: "manager",
    icon: <Shield size={16} />,
    description: "Can review and provide initial approval",
    canEdit: ["applicationStatus", "managerFeedback", "applicationRating"],
    canApprove: true,
    canDisapprove: true,
    canSendToHigherLevel: true,
    color: "text-green-600 bg-green-100"
  },
  {
    name: "Director",
    value: "director",
    icon: <ShieldCheck size={16} />,
    description: "Can review manager approvals and make final decisions",
    canEdit: ["applicationStatus", "managerFeedback"],
    canApprove: true,
    canDisapprove: true,
    canSendToHigherLevel: true,
    color: "text-purple-600 bg-purple-100"
  },
  {
    name: "CEO",
    value: "ceo",
    icon: <ShieldAlert size={16} />,
    description: "Final authority on all decisions",
    canEdit: ["applicationStatus", "managerFeedback"],
    canApprove: true,
    canDisapprove: true,
    canSendToHigherLevel: false,
    color: "text-red-600 bg-red-100"
  }
];

const DataCollectionButton = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [managerApiUrl, setManagerApiUrl] = useState<string>("");
  const [currentAuthLevel, setCurrentAuthLevel] = useState<AuthLevel>(authorizationLevels[0]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    clientDetails: false,
    guarantor1: true,
    guarantor2: true,
    documentation: true
  });
  
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
      applicationStatus: "pending",
      applicationRating: "incomplete",
      fieldNotes: "",
      managerFeedback: "",
      authorizationLevel: "field_officer",
    },
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos' | 'documents') => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      switch (type) {
        case 'photos':
          setPhotos(prev => [...prev, ...filesArray]);
          break;
        case 'videos':
          setVideos(prev => [...prev, ...filesArray]);
          break;
        case 'documents':
          setDocuments(prev => [...prev, ...filesArray]);
          break;
      }
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded`,
        description: `${filesArray.length} ${type} have been added to the application.`,
      });
    }
  };
  
  const captureMedia = async (type: 'photo' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: type === 'video'
      });
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} captured`,
        description: `A ${type} has been captured and added to the application.`,
      });
      
      if (type === 'photo') {
        setPhotos(prev => [...prev, new File([""], `captured_photo_${Date.now()}.jpg`, { type: "image/jpeg" })]);
      } else {
        setVideos(prev => [...prev, new File([""], `captured_video_${Date.now()}.mp4`, { type: "video/mp4" })]);
      }
      
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      toast({
        title: "Capture failed",
        description: `Unable to access camera: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  const sendToManager = async () => {
    if (!managerApiUrl) {
      toast({
        title: "API URL Required",
        description: "Please enter the manager's API endpoint URL",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Sending to manager...",
      description: "Application data is being sent to the manager for review.",
    });
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Sent to manager",
        description: "Application has been successfully sent to the manager.",
      });
      form.setValue('managerFeedback', "Received application. Under review. - Manager");
    }, 2000);
  };

  const removeFile = (index: number, type: 'photos' | 'videos' | 'documents') => {
    switch (type) {
      case 'photos':
        setPhotos(photos.filter((_, i) => i !== index));
        break;
      case 'videos':
        setVideos(videos.filter((_, i) => i !== index));
        break;
      case 'documents':
        setDocuments(documents.filter((_, i) => i !== index));
        break;
    }
    
    toast({
      title: "File removed",
      description: `The ${type.slice(0, -1)} has been removed from the application.`,
    });
  };

  const canEditField = (fieldName: string) => {
    return currentAuthLevel.canEdit.includes(fieldName);
  };

  const changeAuthLevel = (level: string) => {
    const newAuthLevel = authorizationLevels.find(auth => auth.value === level);
    if (newAuthLevel) {
      setCurrentAuthLevel(newAuthLevel);
      form.setValue("authorizationLevel", newAuthLevel.value);
      
      toast({
        title: "Authorization Level Changed",
        description: `You are now operating as a ${newAuthLevel.name}.`,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Client data collected",
      description: `The client information, guarantor details, and ${photos.length + videos.length + documents.length} media files have been saved.`,
    });
    
    console.log({
      formValues: values,
      photoCount: photos.length,
      videoCount: videos.length,
      documentCount: documents.length,
      authorizationLevel: currentAuthLevel.name
    });
    
    // Reset form and state
    form.reset();
    setPhotos([]);
    setVideos([]);
    setDocuments([]);
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
          <div className="flex justify-between items-center">
            <DialogTitle>Client Onboarding Form</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`flex gap-2 ${currentAuthLevel.color} border-2`}>
                  {currentAuthLevel.icon}
                  {currentAuthLevel.name}
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Authorization Levels</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {authorizationLevels.map((level) => (
                  <DropdownMenuItem 
                    key={level.value} 
                    onClick={() => changeAuthLevel(level.value)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="mr-2">{level.icon}</span>
                    <span>{level.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogDescription>
            Collect client information, guarantor details, and media documentation for loan applications and due diligence process.
            <div className="mt-2">
              <Badge className={currentAuthLevel.color}>{currentAuthLevel.description}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="client">1. Client Details</TabsTrigger>
                <TabsTrigger value="guarantor1">2. First Guarantor</TabsTrigger>
                <TabsTrigger value="guarantor2">3. Second Guarantor</TabsTrigger>
                <TabsTrigger value="media">4. Documentation</TabsTrigger>
                <TabsTrigger value="review">5. Review & Submit</TabsTrigger>
              </TabsList>
              
              {/* Client Details Tab */}
              <TabsContent value="client" className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-medium">Client Personal Information</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('clientDetails')}
                    className="p-0 h-8 w-8 rounded-full"
                  >
                    {collapsedSections.clientDetails ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </Button>
                </div>
                
                {!collapsedSections.clientDetails && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} disabled={!canEditField('clientName')} />
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
                              <Input placeholder="NIN12345678" {...field} disabled={!canEditField('nationalId')} />
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
                              <Input placeholder="+256 700 000 000" {...field} disabled={!canEditField('phoneNumber')} />
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
                              <Input placeholder="5,000,000" {...field} disabled={!canEditField('loanAmount')} />
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
                              <Input placeholder="1,500,000" {...field} disabled={!canEditField('income')} />
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
                              <Input placeholder="Plot 123, Example Road, Kampala" {...field} disabled={!canEditField('address')} />
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
                              disabled={!canEditField('loanPurpose')}
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
                              disabled={!canEditField('notes')}
                            />
                          </FormControl>
                          <FormDescription>
                            Add any relevant information for the due diligence process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>
              
              {/* First Guarantor Tab */}
              <TabsContent value="guarantor1" className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-medium">First Guarantor Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('guarantor1')}
                    className="p-0 h-8 w-8 rounded-full"
                  >
                    {collapsedSections.guarantor1 ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </Button>
                </div>
                
                {!collapsedSections.guarantor1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guarantor1Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guarantor Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} disabled={!canEditField('guarantor1Name')} />
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
                              <Input placeholder="NIN12345678" {...field} disabled={!canEditField('guarantor1NationalId')} />
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
                              <Input placeholder="+256 700 000 000" {...field} disabled={!canEditField('guarantor1Phone')} />
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
                              <Input placeholder="Family member, colleague, etc." {...field} disabled={!canEditField('guarantor1Relation')} />
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
                            <Input placeholder="Plot 123, Example Road, Kampala" {...field} disabled={!canEditField('guarantor1Address')} />
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
                              disabled={!canEditField('guarantor1Commitment')}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify what the guarantor is committing to in relation to this loan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>
              
              {/* Second Guarantor Tab */}
              <TabsContent value="guarantor2" className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-medium">Second Guarantor Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('guarantor2')}
                    className="p-0 h-8 w-8 rounded-full"
                  >
                    {collapsedSections.guarantor2 ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </Button>
                </div>
                
                {!collapsedSections.guarantor2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guarantor2Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guarantor Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} disabled={!canEditField('guarantor2Name')} />
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
                              <Input placeholder="NIN12345678" {...field} disabled={!canEditField('guarantor2NationalId')} />
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
                              <Input placeholder="+256 700 000 000" {...field} disabled={!canEditField('guarantor2Phone')} />
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
                              <Input placeholder="Family member, colleague, etc." {...field} disabled={!canEditField('guarantor2Relation')} />
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
                            <Input placeholder="Plot 123, Example Road, Kampala" {...field} disabled={!canEditField('guarantor2Address')} />
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
                              disabled={!canEditField('guarantor2Commitment')}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify what the guarantor is committing to in relation to this loan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>
              
              {/* Media Capture Tab */}
              <TabsContent value="media" className="space-y-6 pt-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-medium">Documentation & Media</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('documentation')}
                    className="p-0 h-8 w-8 rounded-full"
                  >
                    {collapsedSections.documentation ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </Button>
                </div>
                
                {!collapsedSections.documentation && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Photo & Video Documentation</h3>
                      <p className="text-sm text-gray-500 mb-4">Capture images of the client, property, and relevant documents.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex gap-2 items-center"
                          onClick={() => captureMedia('photo')}
                          disabled={!canEditField('fieldNotes')}
                        >
                          <Camera size={18} />
                          Take Photo
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline"
                          className="flex gap-2 items-center"
                          onClick={() => captureMedia('video')}
                          disabled={!canEditField('fieldNotes')}
                        >
                          <Video size={18} />
                          Record Video
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Upload Media Files</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <Label htmlFor="photoUpload" className="block mb-2">Upload Photos</Label>
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="photoUpload"
                              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ${!canEditField('fieldNotes') ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Camera className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Upload client photos</p>
                              </div>
                              <input
                                id="photoUpload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e, 'photos')}
                                disabled={!canEditField('fieldNotes')}
                              />
                            </label>
                          </div>
                          {photos.length > 0 && (
                            <p className="text-sm mt-1 text-gray-500">
                              {photos.length} photo{photos.length > 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="videoUpload" className="block mb-2">Upload Videos</Label>
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="videoUpload"
                              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ${!canEditField('fieldNotes') ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Video className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Upload video files</p>
                              </div>
                              <input
                                id="videoUpload"
                                type="file"
                                className="hidden"
                                accept="video/*"
                                multiple
                                onChange={(e) => handleFileChange(e, 'videos')}
                                disabled={!canEditField('fieldNotes')}
                              />
                            </label>
                          </div>
                          {videos.length > 0 && (
                            <p className="text-sm mt-1 text-gray-500">
                              {videos.length} video{videos.length > 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="documentUpload" className="block mb-2">Scan Documents</Label>
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="documentUpload"
                              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ${!canEditField('fieldNotes') ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Scan className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Scan & upload documents</p>
                              </div>
                              <input
                                id="documentUpload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.png"
                                multiple
                                onChange={(e) => handleFileChange(e, 'documents')}
                                disabled={!canEditField('fieldNotes')}
                              />
                            </label>
                          </div>
                          {documents.length > 0 && (
                            <p className="text-sm mt-1 text-gray-500">
                              {documents.length} document{documents.length > 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="fieldNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Worker Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any additional observations or notes from your field visit"
                              className="h-24"
                              {...field}
                              disabled={!canEditField('fieldNotes')}
                            />
                          </FormControl>
                          <FormDescription>
                            Document any relevant observations about the client, property, or circumstances
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Manager Communication</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="managerApiUrl">Manager API Endpoint URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="managerApiUrl"
                              placeholder="https://api.example.com/manager/feedback"
                              className="flex-grow"
                              value={managerApiUrl}
                              onChange={(e) => setManagerApiUrl(e.target.value)}
                              disabled={!currentAuthLevel.canSendToHigherLevel}
                            />
                            <Button 
                              type="button" 
                              onClick={sendToManager}
                              disabled={!managerApiUrl || !currentAuthLevel.canSendToHigherLevel}
                            >
                              Send
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the API URL to send the current application data to the manager
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="managerFeedback">Manager Feedback</Label>
                          <Textarea
                            id="managerFeedback"
                            disabled
                            placeholder="No feedback received yet"
                            value={form.watch("managerFeedback") || ""}
                            className="h-16 bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              {/* Review & Submit Tab */}
              <TabsContent value="review" className="space-y-6 pt-4">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-medium mb-4">Application Rating</h3>
                  
                  <FormField
                    control={form.control}
                    name="applicationRating"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Documentation Completeness</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            disabled={!canEditField('applicationRating')}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="complete" id="complete" />
                              <Label htmlFor="complete" className="flex items-center">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                Complete - All required documentation provided
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="incomplete" id="incomplete" />
                              <Label htmlFor="incomplete" className="flex items-center">
                                <X className="w-4 h-4 text-red-500 mr-2" />
                                Incomplete - Missing required documentation
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="applicationStatus"
                    render={({ field }) => (
                      <FormItem className="space-y-3 mt-6">
                        <FormLabel>Application Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            disabled={!canEditField('applicationStatus') || (!currentAuthLevel.canApprove && !currentAuthLevel.canDisapprove)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="approved" id="approved" disabled={!currentAuthLevel.canApprove} />
                              <Label htmlFor="approved" className="flex items-center">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                Approved - Application meets all requirements
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="disapproved" id="disapproved" disabled={!currentAuthLevel.canDisapprove} />
                              <Label htmlFor="disapproved" className="flex items-center">
                                <X className="w-4 h-4 text-red-500 mr-2" />
                                Disapproved - Application does not qualify
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pending" id="pending" />
                              <Label htmlFor="pending">
                                Pending - Further review required
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4">Uploaded Documentation</h3>
                  <div className="space-y-4">
                    {/* Photos Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Photos ({photos.length})</h4>
                      {photos.length === 0 ? (
                        <p className="text-sm text-gray-500">No photos uploaded</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {photos.map((photo, index) => (
                            <Badge 
                              key={index} 
                              className="flex gap-1 items-center px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              onClick={() => canEditField('fieldNotes') && removeFile(index, 'photos')}
                            >
                              {photo.name.substring(0, 15)}{photo.name.length > 15 ? '...' : ''}
                              {canEditField('fieldNotes') && <X className="w-3 h-3 cursor-pointer" />}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Videos Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Videos ({videos.length})</h4>
                      {videos.length === 0 ? (
                        <p className="text-sm text-gray-500">No videos uploaded</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {videos.map((video, index) => (
                            <Badge 
                              key={index} 
                              className="flex gap-1 items-center px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              onClick={() => canEditField('fieldNotes') && removeFile(index, 'videos')}
                            >
                              {video.name.substring(0, 15)}{video.name.length > 15 ? '...' : ''}
                              {canEditField('fieldNotes') && <X className="w-3 h-3 cursor-pointer" />}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Documents Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Documents ({documents.length})</h4>
                      {documents.length === 0 ? (
                        <p className="text-sm text-gray-500">No documents uploaded</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {documents.map((doc, index) => (
                            <Badge 
                              key={index} 
                              className="flex gap-1 items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              onClick={() => canEditField('fieldNotes') && removeFile(index, 'documents')}
                            >
                              {doc.name.substring(0, 15)}{doc.name.length > 15 ? '...' : ''}
                              {canEditField('fieldNotes') && <X className="w-3 h-3 cursor-pointer" />}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Card className={`border-l-4 ${form.watch('applicationStatus') === 'approved' ? 'border-l-green-500' : form.watch('applicationStatus') === 'disapproved' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-medium">
                          Application Status: 
                          <span className={`ml-2 ${
                            form.watch('applicationStatus') === 'approved' ? 'text-green-600' : 
                            form.watch('applicationStatus') === 'disapproved' ? 'text-red-600' : 
                            'text-yellow-600'
                          }`}>
                            {form.watch('applicationStatus').charAt(0).toUpperCase() + form.watch('applicationStatus').slice(1)}
                          </span>
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${
                            form.watch('applicationRating') === 'complete' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {form.watch('applicationRating') === 'complete' ? 'Complete Documentation' : 'Incomplete Documentation'}
                          </Badge>
                          
                          <Badge className={`${currentAuthLevel.color}`}>
                            {currentAuthLevel.name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
