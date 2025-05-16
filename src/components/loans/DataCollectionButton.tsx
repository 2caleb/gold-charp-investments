import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, FilePlus, Camera, ScanLine, Video } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSection } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useMediaCapture } from '@/hooks/use-media-capture';
import { ScrollArea } from "@/components/ui/scroll-area";
import GuarantorSection, { GuarantorData } from './GuarantorSection';
import { useLoanCalculator } from '@/hooks/use-loan-calculator';
import LoanCalculationDisplay from './LoanCalculationDisplay';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

// Define the form schema with Zod
const clientFormSchema = z.object({
  clientName: z.string().min(1, { message: "Client name is required" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  idNumber: z.string().min(1, { message: "ID number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  loanType: z.string().min(1, { message: "Loan type is required" }),
  loanAmount: z.string().min(1, { message: "Loan amount is required" }),
  loanDuration: z.string().min(1, { message: "Loan duration is required" }),
  durationType: z.enum(['daily', 'weekly', 'monthly']),
  purposeOfLoan: z.string().min(1, { message: "Purpose of loan is required" }),
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed']),
  monthlyIncome: z.string().min(1, { message: "Monthly income is required" }),
  notes: z.string().optional(),
  guarantors: z.array(
    z.object({
      fullName: z.string().min(1, { message: "Guarantor name is required" }),
      idNumber: z.string().min(1, { message: "ID number is required" }),
      phoneNumber: z.string().min(1, { message: "Phone number is required" }),
      email: z.string().email().optional().or(z.literal('')),
      address: z.string().min(1, { message: "Address is required" }),
      relationship: z.string().min(1, { message: "Relationship is required" }),
      occupation: z.string().min(1, { message: "Occupation is required" }),
      employer: z.string().min(1, { message: "Employer is required" }),
      monthlyIncome: z.string().min(1, { message: "Monthly income is required" }),
      yearsKnown: z.string().min(1, { message: "Years known is required" }),
      commitmentStatement: z.string().min(10, { message: "Please provide a detailed commitment statement" }),
      agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" }),
      documents: z.object({
        idDocument: z.any().optional(),
        proofOfIncome: z.any().optional(),
        proofOfAddress: z.any().optional(),
      }),
    })
  ).length(2, { message: "Both guarantors are required" }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

// Define specific media capture types
type CaptureType = 'photo' | 'video' | 'document' | 'idCard';

const DataCollectionButton = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCaptureType, setActiveCaptureType] = useState<CaptureType | null>(null);
  
  // Initialize media capture hook
  const { captureImage, captureVideo, scanDocument, MediaCaptureUI } = useMediaCapture();
  
  // Fixed interest rate
  const FIXED_INTEREST_RATE = 18; // 18% annual interest rate

  // Initialize the form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientName: '',
      phoneNumber: '',
      idNumber: '',
      address: '',
      loanType: '',
      loanAmount: '',
      loanDuration: '1',
      durationType: 'monthly',
      purposeOfLoan: '',
      employmentStatus: 'employed',
      monthlyIncome: '',
      notes: '',
      guarantors: [
        {
          fullName: '',
          idNumber: '',
          phoneNumber: '',
          email: '',
          address: '',
          relationship: '',
          occupation: '',
          employer: '',
          monthlyIncome: '',
          yearsKnown: '',
          commitmentStatement: '',
          agreeToTerms: false,
          documents: {
            idDocument: null,
            proofOfIncome: null,
            proofOfAddress: null,
          },
        },
        {
          fullName: '',
          idNumber: '',
          phoneNumber: '',
          email: '',
          address: '',
          relationship: '',
          occupation: '',
          employer: '',
          monthlyIncome: '',
          yearsKnown: '',
          commitmentStatement: '',
          agreeToTerms: false,
          documents: {
            idDocument: null,
            proofOfIncome: null,
            proofOfAddress: null,
          },
        }
      ],
    },
  });

  // Watch loan amount, duration, and type for calculation
  const loanAmount = form.watch('loanAmount');
  const loanDuration = form.watch('loanDuration');
  const durationType = form.watch('durationType');
  
  // Use the loan calculator hook with the fixed 18% rate
  const { calculation } = useLoanCalculator(
    parseFloat(loanAmount || '0'),
    parseInt(loanDuration || '1'),
    durationType,
    FIXED_INTEREST_RATE // Use the fixed 18% interest rate
  );
  
  // Handle form submission
  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    
    // In a real app, you would send this data to your backend
    console.log('Client data:', data);
    
    // For demo purposes, simulate an API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      toast({
        title: 'Client data collected',
        description: `${data.clientName}'s information has been successfully collected.`,
      });
    }, 1500);
  };

  // Handle capturing client photo
  const handleCaptureClientPhoto = async () => {
    setActiveCaptureType('photo');
    try {
      const imageData = await captureImage();
      toast({
        title: 'Photo captured',
        description: 'Client photo has been successfully captured.',
      });
      // Here you could store the image or associate it with the client data
      // For example: form.setValue('clientPhotoData', imageData);
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to capture photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActiveCaptureType(null);
    }
  };

  // Handle recording client video
  const handleRecordClientVideo = async () => {
    setActiveCaptureType('video');
    try {
      const videoData = await captureVideo();
      toast({
        title: 'Video recorded',
        description: 'Client video has been successfully recorded.',
      });
      // Here you could store the video or associate it with the client data
      // For example: form.setValue('clientVideoData', videoData);
    } catch (error) {
      console.error('Error recording video:', error);
      toast({
        title: 'Error',
        description: 'Failed to record video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActiveCaptureType(null);
    }
  };

  // Handle ID card scanning
  const handleScanIDCard = async () => {
    setActiveCaptureType('idCard');
    try {
      const documentData = await scanDocument();
      toast({
        title: 'ID Scanned',
        description: 'ID card has been successfully scanned.',
      });
      
      // Here you could implement OCR to extract ID number and other info
      // or just store the scanned document
    } catch (error) {
      console.error('Error scanning ID:', error);
      toast({
        title: 'Error',
        description: 'Failed to scan ID card. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActiveCaptureType(null);
    }
  };

  // Handle other document scanning
  const handleScanDocument = async () => {
    setActiveCaptureType('document');
    try {
      const documentData = await scanDocument();
      toast({
        title: 'Document scanned',
        description: 'Client document has been successfully scanned.',
      });
      // Here you could store the document or associate it with the client data
    } catch (error) {
      console.error('Error scanning document:', error);
      toast({
        title: 'Error',
        description: 'Failed to scan document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActiveCaptureType(null);
    }
  };

  // Handle printing the form
  const handlePrintForm = () => {
    const data = form.getValues();
    const calculationData = calculation;
    
    // Prepare print content
    const printContent = `
      <html>
        <head>
          <title>Client Loan Application</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 10px; padding-bottom: 5px; }
            .field { margin-bottom: 5px; }
            .label { font-weight: bold; display: inline-block; width: 180px; }
            .value { display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .guarantor { margin-top: 30px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Client Loan Application Form</h2>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Client Information</div>
            <div class="field"><span class="label">Client Name:</span> <span class="value">${data.clientName}</span></div>
            <div class="field"><span class="label">Phone Number:</span> <span class="value">${data.phoneNumber}</span></div>
            <div class="field"><span class="label">ID Number:</span> <span class="value">${data.idNumber}</span></div>
            <div class="field"><span class="label">Address:</span> <span class="value">${data.address}</span></div>
          </div>
          
          <div class="section">
            <div class="section-title">Loan Details</div>
            <div class="field"><span class="label">Loan Type:</span> <span class="value">${data.loanType}</span></div>
            <div class="field"><span class="label">Loan Amount:</span> <span class="value">${parseInt(data.loanAmount).toLocaleString('en-UG')}</span></div>
            <div class="field"><span class="label">Loan Duration:</span> <span class="value">${data.loanDuration} ${data.durationType}</span></div>
            <div class="field"><span class="label">Purpose of Loan:</span> <span class="value">${data.purposeOfLoan}</span></div>
            <div class="field"><span class="label">Employment Status:</span> <span class="value">${data.employmentStatus}</span></div>
            <div class="field"><span class="label">Monthly Income:</span> <span class="value">${parseInt(data.monthlyIncome).toLocaleString('en-UG')}</span></div>
            ${data.notes ? `<div class="field"><span class="label">Notes:</span> <span class="value">${data.notes}</span></div>` : ''}
          </div>
          
          ${calculationData ? `
          <div class="section">
            <div class="section-title">Loan Calculation (Fixed 18% Annual Interest)</div>
            <div class="field"><span class="label">Principal Amount:</span> <span class="value">${calculationData.principal.toLocaleString('en-UG')}</span></div>
            <div class="field"><span class="label">Total Interest:</span> <span class="value">${calculationData.totalInterest.toLocaleString('en-UG')}</span></div>
            <div class="field"><span class="label">Total Repayment:</span> <span class="value">${calculationData.totalAmount.toLocaleString('en-UG')}</span></div>
            
            <table>
              <tr>
                <th>Period</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Payment</th>
              </tr>
              ${calculationData.payments.slice(0, 5).map((payment, i) => `
                <tr>
                  <td>${data.durationType === 'daily' ? 'Day' : data.durationType === 'weekly' ? 'Week' : 'Month'} ${payment.number}</td>
                  <td>${payment.principal.toLocaleString('en-UG')}</td>
                  <td>${payment.interest.toLocaleString('en-UG')}</td>
                  <td>${payment.total.toLocaleString('en-UG')}</td>
                </tr>
              `).join('')}
              ${calculationData.payments.length > 5 ? `
                <tr>
                  <td colspan="3" style="text-align: center;">... ${calculationData.payments.length - 5} more payments</td>
                  <td>${calculationData.totalAmount.toLocaleString('en-UG')}</td>
                </tr>
              ` : ''}
            </table>
          </div>
          ` : ''}
          
          <!-- First Guarantor -->
          <div class="guarantor">
            <div class="section-title">First Guarantor Information</div>
            <div class="field"><span class="label">Full Name:</span> <span class="value">${data.guarantors[0]?.fullName || ''}</span></div>
            <div class="field"><span class="label">ID Number:</span> <span class="value">${data.guarantors[0]?.idNumber || ''}</span></div>
            <div class="field"><span class="label">Phone Number:</span> <span class="value">${data.guarantors[0]?.phoneNumber || ''}</span></div>
            <div class="field"><span class="label">Email:</span> <span class="value">${data.guarantors[0]?.email || ''}</span></div>
            <div class="field"><span class="label">Address:</span> <span class="value">${data.guarantors[0]?.address || ''}</span></div>
            <div class="field"><span class="label">Relationship to Client:</span> <span class="value">${data.guarantors[0]?.relationship || ''}</span></div>
            <div class="field"><span class="label">Occupation:</span> <span class="value">${data.guarantors[0]?.occupation || ''}</span></div>
            <div class="field"><span class="label">Employer:</span> <span class="value">${data.guarantors[0]?.employer || ''}</span></div>
            <div class="field"><span class="label">Monthly Income:</span> <span class="value">${parseInt(data.guarantors[0]?.monthlyIncome || '0').toLocaleString('en-UG')}</span></div>
            <div class="field"><span class="label">Years Known Client:</span> <span class="value">${data.guarantors[0]?.yearsKnown || ''}</span></div>
            <div class="field"><span class="label">Commitment Statement:</span> <span class="value">${data.guarantors[0]?.commitmentStatement || ''}</span></div>
          </div>
          
          <!-- Second Guarantor -->
          <div class="guarantor">
            <div class="section-title">Second Guarantor Information</div>
            <div class="field"><span class="label">Full Name:</span> <span class="value">${data.guarantors[1]?.fullName || ''}</span></div>
            <div class="field"><span class="label">ID Number:</span> <span class="value">${data.guarantors[1]?.idNumber || ''}</span></div>
            <div class="field"><span class="label">Phone Number:</span> <span class="value">${data.guarantors[1]?.phoneNumber || ''}</span></div>
            <div class="field"><span class="label">Email:</span> <span class="value">${data.guarantors[1]?.email || ''}</span></div>
            <div class="field"><span class="label">Address:</span> <span class="value">${data.guarantors[1]?.address || ''}</span></div>
            <div class="field"><span class="label">Relationship to Client:</span> <span class="value">${data.guarantors[1]?.relationship || ''}</span></div>
            <div class="field"><span class="label">Occupation:</span> <span class="value">${data.guarantors[1]?.occupation || ''}</span></div>
            <div class="field"><span class="label">Employer:</span> <span class="value">${data.guarantors[1]?.employer || ''}</span></div>
            <div class="field"><span class="label">Monthly Income:</span> <span class="value">${parseInt(data.guarantors[1]?.monthlyIncome || '0').toLocaleString('en-UG')}</span></div>
            <div class="field"><span class="label">Years Known Client:</span> <span class="value">${data.guarantors[1]?.yearsKnown || ''}</span></div>
            <div class="field"><span class="label">Commitment Statement:</span> <span class="value">${data.guarantors[1]?.commitmentStatement || ''}</span></div>
          </div>
          
          <div class="footer">
            <p>This document was generated on ${new Date().toLocaleString()}.</p>
          </div>
        </body>
      </html>
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Give the browser some time to load the content before printing
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast({
        title: 'Error',
        description: 'Unable to open print window. Please check your popup blocker settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <ClipboardList className="mr-2 h-4 w-4" />
          Collect Client Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Client Data Collection</DialogTitle>
          <DialogDescription>
            Enter the client's information below to collect data for loan processing.
            All calculations use a fixed 18% annual interest rate.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Client Personal Information */}
              <FormSection title="Client Information" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ID number" {...field} />
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
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Enhanced Media Capture Buttons with status indicators */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCaptureClientPhoto}
                  disabled={activeCaptureType !== null}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {activeCaptureType === 'photo' ? 'Capturing...' : 'Capture Photo'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleRecordClientVideo}
                  disabled={activeCaptureType !== null}
                >
                  <Video className="mr-2 h-4 w-4" />
                  {activeCaptureType === 'video' ? 'Recording...' : 'Record Video'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleScanIDCard}
                  disabled={activeCaptureType !== null}
                >
                  <ScanLine className="mr-2 h-4 w-4" />
                  {activeCaptureType === 'idCard' ? 'Scanning...' : 'Scan ID Card'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleScanDocument}
                  disabled={activeCaptureType !== null}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  {activeCaptureType === 'document' ? 'Scanning...' : 'Scan Document'}
                </Button>
              </div>
              
              {/* Loan Information */}
              <FormSection title="Loan Details" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select loan type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="personal">Personal Loan</SelectItem>
                          <SelectItem value="business">Business Loan</SelectItem>
                          <SelectItem value="mortgage">Mortgage</SelectItem>
                          <SelectItem value="education">Education Loan</SelectItem>
                          <SelectItem value="auto">Auto Loan</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input 
                          type="number" 
                          placeholder="Enter loan amount" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="loanDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Duration</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter duration" 
                          min="1" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment frequency" />
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
                  name="purposeOfLoan"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Purpose of Loan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter purpose of loan" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Display loan calculation with fixed 18% rate */}
              {calculation && (
                <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Loan Calculation (Fixed 18% Annual Interest)
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Principal Amount</p>
                        <p className="font-semibold">UGX {calculation.principal.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Total Interest</p>
                        <p className="font-semibold">UGX {calculation.totalInterest.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Total Repayment</p>
                        <p className="font-semibold">UGX {calculation.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Payment</th>
                            <th className="text-right py-2">Principal</th>
                            <th className="text-right py-2">Interest</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculation.payments.slice(0, 5).map((payment, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-2">
                                {durationType === 'daily' ? 'Day' : 
                                 durationType === 'weekly' ? 'Week' : 'Month'} {payment.number}
                              </td>
                              <td className="text-right py-2">UGX {payment.principal.toLocaleString()}</td>
                              <td className="text-right py-2">UGX {payment.interest.toLocaleString()}</td>
                              <td className="text-right py-2">UGX {payment.total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {calculation.payments.length > 5 && (
                      <p className="text-sm text-center text-gray-500 mt-2">
                        ... {calculation.payments.length - 5} more payments
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Employment Information */}
              <FormSection title="Employment Information" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Employment Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="employed" id="employed" />
                            <FormLabel htmlFor="employed" className="font-normal">Employed</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self-employed" id="self-employed" />
                            <FormLabel htmlFor="self-employed" className="font-normal">Self-Employed</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unemployed" id="unemployed" />
                            <FormLabel htmlFor="unemployed" className="font-normal">Unemployed</FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
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
                        <Input type="number" placeholder="Enter monthly income" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional information about the client that might be relevant for the loan application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* First Guarantor Section */}
              <GuarantorSection 
                control={form.control} 
                index={0} 
                guarantorLabel="First Guarantor Information" 
              />
              
              {/* Second Guarantor Section */}
              <GuarantorSection 
                control={form.control} 
                index={1} 
                guarantorLabel="Second Guarantor Information" 
              />
              
              {/* Form Submission and Print Buttons */}
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrintForm}>
                  Print Form
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Data'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>
        
        {/* Render the MediaCapture UI when needed */}
        {MediaCaptureUI}
      </DialogContent>
    </Dialog>
  );
};

export default DataCollectionButton;
