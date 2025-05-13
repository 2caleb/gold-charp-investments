import React, { useState, useEffect, useRef } from 'react';
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
import { Printer, ClipboardList, FileUp, Camera, Loader2, Video, ScanLine } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MediaCapture } from '@/components/media/MediaCapture';
import { DocumentScanner } from '@/components/media/DocumentScanner';
import { formatCurrency } from '@/lib/utils';

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
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoCamera, setShowVideoCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{photos: string[], videos: string[], documents: string[]}>({
    photos: [],
    videos: [],
    documents: []
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

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
      
      // 2. Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      // 3. Trigger the email workflow
      const response = await fetch('https://bjsxekgraxbfqzhbqjff.supabase.co/functions/v1/send-approval-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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
      setCapturedMedia({photos: [], videos: [], documents: []});
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
    // Create a new print window with the entire form content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }
    
    // Get the current form values
    const values = form.getValues();
    
    // Format currency values for display
    const formattedLoanAmount = values.loanAmount && !isNaN(Number(values.loanAmount)) 
      ? formatCurrency(Number(values.loanAmount), 'UGX')
      : values.loanAmount;
      
    const formattedMonthlyIncome = values.monthlyIncome && !isNaN(Number(values.monthlyIncome)) 
      ? formatCurrency(Number(values.monthlyIncome), 'UGX')
      : values.monthlyIncome;
    
    // Build HTML content for the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Loan Application Form - ${values.clientName || 'Client'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #8A2BE2;
            padding-bottom: 10px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #8A2BE2;
          }
          .section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #8A2BE2;
          }
          .field {
            margin-bottom: 10px;
          }
          .field-label {
            font-weight: bold;
            display: inline-block;
            width: 200px;
          }
          .field-value {
            display: inline-block;
          }
          .media-section {
            margin-top: 20px;
          }
          .media-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 10px;
          }
          .media-item {
            max-width: 200px;
            max-height: 200px;
            border: 1px solid #ddd;
          }
          @media print {
            .media-item {
              break-inside: avoid;
            }
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 200px;
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Gold Charp Investments Limited</div>
          <div>Loan Application Form</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="field">
            <span class="field-label">Client Name:</span>
            <span class="field-value">${values.clientName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Phone Number:</span>
            <span class="field-value">${values.phoneNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">ID Number:</span>
            <span class="field-value">${values.idNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Residential Address:</span>
            <span class="field-value">${values.address || 'N/A'}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Loan Information</div>
          <div class="field">
            <span class="field-label">Loan Type:</span>
            <span class="field-value">${values.loanType ? values.loanType.charAt(0).toUpperCase() + values.loanType.slice(1) + ' Loan' : 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Loan Amount:</span>
            <span class="field-value">${formattedLoanAmount || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Purpose of Loan:</span>
            <span class="field-value">${values.purposeOfLoan || 'N/A'}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Financial Information</div>
          <div class="field">
            <span class="field-label">Employment Status:</span>
            <span class="field-value">${values.employmentStatus ? values.employmentStatus.charAt(0).toUpperCase() + values.employmentStatus.slice(1) : 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Monthly Income:</span>
            <span class="field-value">${formattedMonthlyIncome || 'N/A'}</span>
          </div>
        </div>
        
        ${values.notes ? `
        <div class="section">
          <div class="section-title">Additional Notes</div>
          <div class="field">
            <span class="field-value">${values.notes}</span>
          </div>
        </div>
        ` : ''}
        
        ${capturedMedia.photos.length > 0 || capturedMedia.videos.length > 0 || capturedMedia.documents.length > 0 ? `
        <div class="section media-section">
          <div class="section-title">Attached Media</div>
          
          ${capturedMedia.photos.length > 0 ? `
          <div class="field">
            <div class="field-label">Photos:</div>
            <div class="media-container">
              ${capturedMedia.photos.map((photo, index) => `
                <img src="${photo}" alt="Photo ${index + 1}" class="media-item">
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          ${capturedMedia.documents.length > 0 ? `
          <div class="field">
            <div class="field-label">Documents:</div>
            <div class="media-container">
              ${capturedMedia.documents.map((doc, index) => `
                <img src="${doc}" alt="Document ${index + 1}" class="media-item">
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <div class="signatures">
          <div>
            <div class="signature-line"></div>
            <div>Client Signature</div>
          </div>
          <div>
            <div class="signature-line"></div>
            <div>Officer Signature</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Gold Charp Investments Limited &copy; ${new Date().getFullYear()}. All rights reserved.</p>
          <p>This document is confidential and contains private information.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            // Uncomment below if you want the window to close after printing
            // setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    toast({
      title: "Printing",
      description: "Sending document to printer...",
    });
  };
  
  const handleMediaCapture = (mediaType: 'photo' | 'video', mediaData: string) => {
    if (mediaType === 'photo') {
      setCapturedMedia(prev => ({
        ...prev,
        photos: [...prev.photos, mediaData]
      }));
      setShowCamera(false);
    } else {
      setCapturedMedia(prev => ({
        ...prev,
        videos: [...prev.videos, mediaData]
      }));
      setShowVideoCamera(false);
    }
    
    toast({
      title: mediaType === 'photo' ? "Photo Captured" : "Video Recorded",
      description: `${mediaType === 'photo' ? 'Photo' : 'Video'} has been captured successfully.`,
    });
  };
  
  const handleDocumentScan = (documentData: string) => {
    setCapturedMedia(prev => ({
      ...prev,
      documents: [...prev.documents, documentData]
    }));
    setShowScanner(false);
    
    toast({
      title: "Document Scanned",
      description: "Document has been scanned successfully.",
    });
  };
  
  const deleteMedia = (type: 'photo' | 'video' | 'document', index: number) => {
    setCapturedMedia(prev => {
      const newMedia = { ...prev };
      if (type === 'photo') {
        newMedia.photos = prev.photos.filter((_, i) => i !== index);
      } else if (type === 'video') {
        newMedia.videos = prev.videos.filter((_, i) => i !== index);
      } else {
        newMedia.documents = prev.documents.filter((_, i) => i !== index);
      }
      return newMedia;
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
          
          {showCamera && (
            <MediaCapture 
              type="photo" 
              onCapture={(data) => handleMediaCapture('photo', data)} 
              onCancel={() => setShowCamera(false)} 
            />
          )}
          
          {showVideoCamera && (
            <MediaCapture 
              type="video" 
              onCapture={(data) => handleMediaCapture('video', data)} 
              onCancel={() => setShowVideoCamera(false)} 
            />
          )}
          
          {showScanner && (
            <DocumentScanner 
              onScan={handleDocumentScan} 
              onCancel={() => setShowScanner(false)} 
            />
          )}
          
          {!showCamera && !showVideoCamera && !showScanner && (
            <Form {...form}>
              <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <Input placeholder="e.g. +256 712 345 678" {...field} className="h-12" />
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
                              <FormLabel>Loan Amount (UGX)</FormLabel>
                              <FormControl>
                                <Input placeholder="Amount in UGX" {...field} className="h-12" />
                              </FormControl>
                              <FormDescription>
                                {field.value && !isNaN(Number(field.value)) 
                                  ? formatCurrency(Number(field.value), 'UGX')
                                  : 'Enter amount in Uganda Shillings'}
                              </FormDescription>
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
                            <FormLabel>Monthly Income (UGX)</FormLabel>
                            <FormControl>
                              <Input placeholder="Income in UGX" {...field} className="h-12" />
                            </FormControl>
                            <FormDescription>
                              {field.value && !isNaN(Number(field.value)) 
                                ? formatCurrency(Number(field.value), 'UGX')
                                : 'Enter amount in Uganda Shillings'}
                            </FormDescription>
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
                      <h4 className="text-md font-medium">Media & Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-12"
                          onClick={() => setShowCamera(true)}
                        >
                          <Camera className="mr-2" size={18} />
                          Take Photo
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-12"
                          onClick={() => setShowVideoCamera(true)}
                        >
                          <Video className="mr-2" size={18} />
                          Record Video
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-12"
                          onClick={() => setShowScanner(true)}
                        >
                          <ScanLine className="mr-2" size={18} />
                          Scan Document
                        </Button>
                      </div>
                    </div>
                    
                    {/* Display captured media */}
                    {(capturedMedia.photos.length > 0 || capturedMedia.videos.length > 0 || capturedMedia.documents.length > 0) && (
                      <div className="mt-6">
                        <h4 className="text-md font-medium mb-3">Captured Media</h4>
                        
                        {/* Photos */}
                        {capturedMedia.photos.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">Photos ({capturedMedia.photos.length})</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {capturedMedia.photos.map((photo, index) => (
                                <div key={`photo-${index}`} className="relative group">
                                  <img 
                                    src={photo} 
                                    alt={`Captured photo ${index + 1}`} 
                                    className="w-full h-24 object-cover rounded-md"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => deleteMedia('photo', index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Videos */}
                        {capturedMedia.videos.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">Videos ({capturedMedia.videos.length})</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {capturedMedia.videos.map((video, index) => (
                                <div key={`video-${index}`} className="relative group">
                                  <video 
                                    src={video} 
                                    controls 
                                    className="w-full h-32 object-cover rounded-md"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => deleteMedia('video', index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Documents */}
                        {capturedMedia.documents.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Documents ({capturedMedia.documents.length})</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {capturedMedia.documents.map((doc, index) => (
                                <div key={`doc-${index}`} className="relative group">
                                  <img 
                                    src={doc} 
                                    alt={`Scanned document ${index + 1}`} 
                                    className="w-full h-32 object-cover rounded-md"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => deleteMedia('document', index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataCollectionButton;
