import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCcw } from 'lucide-react';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

// Extended schema to include guarantor fields
const loanFormSchema = z.object({
  // Loan Identification
  loanIdentificationNumber: z.string().min(1, { message: 'Loan ID is required' }),
  
  // Personal Information
  fullName: z.string().min(3, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  nationalId: z.string().min(5, { message: 'National ID is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  
  // Guarantor 1
  guarantor1FullName: z.string().min(3, { message: 'Guarantor full name is required' }),
  guarantor1Phone: z.string().min(10, { message: 'Valid phone number is required' }),
  guarantor1NationalId: z.string().min(5, { message: 'National ID is required' }),
  guarantor1Relationship: z.string().min(1, { message: 'Relationship is required' }),
  guarantor1Address: z.string().min(5, { message: 'Address is required' }),

  // Guarantor 2
  guarantor2FullName: z.string().min(3, { message: 'Guarantor full name is required' }),
  guarantor2Phone: z.string().min(10, { message: 'Valid phone number is required' }),
  guarantor2NationalId: z.string().min(5, { message: 'National ID is required' }),
  guarantor2Relationship: z.string().min(1, { message: 'Relationship is required' }),
  guarantor2Address: z.string().min(5, { message: 'Address is required' }),
  
  // Loan Details
  loanType: z.string().min(1, { message: 'Loan type is required' }),
  loanAmount: z.string().min(1, { message: 'Loan amount is required' }),
  loanPurpose: z.string().min(5, { message: 'Loan purpose is required' }),
  loanTerm: z.string().min(1, { message: 'Loan term is required' }),
  
  // Employment Details
  employmentStatus: z.string().min(1, { message: 'Employment status is required' }),
  employerName: z.string().optional(),
  monthlyIncome: z.string().min(1, { message: 'Monthly income is required' }),
  
  // Collateral Information
  hasCollateral: z.boolean().default(false),
  collateralType: z.string().optional(),
  collateralValue: z.string().optional(),
  collateralDescription: z.string().optional(),
  
  // Terms and Conditions
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

// Types for uploaded files
interface UploadedFile {
  name: string;
  size: number;
  url?: string;
  type: string;
  id?: string;
}

// Mock document verification service
const documentVerificationService = {
  verifyNationalId: async (documentId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, this would return verification status
    return;
  },
  
  verifyLandTitle: async (documentId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return;
  },
  
  verifyBusinessLicense: async (documentId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return;
  },
  
  verifyBankStatement: async (documentId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return;
  },
};

const LoanApplicationForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('identification');
  const [loanId, setLoanId] = useState<string>('');
  
  // Track uploaded documents
  const [nationalIdDocuments, setNationalIdDocuments] = useState<UploadedFile[]>([]);
  const [collateralDocuments, setCollateralDocuments] = useState<UploadedFile[]>([]);
  const [incomeDocuments, setIncomeDocuments] = useState<UploadedFile[]>([]);
  const [guarantor1Documents, setGuarantor1Documents] = useState<UploadedFile[]>([]);
  const [guarantor2Documents, setGuarantor2Documents] = useState<UploadedFile[]>([]);
  
  // Generate a loan ID when the component mounts
  useEffect(() => {
    setLoanId(generateLoanIdentificationNumber());
  }, []);
  
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loanIdentificationNumber: '',
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      address: '',
      guarantor1FullName: '',
      guarantor1Phone: '',
      guarantor1NationalId: '',
      guarantor1Relationship: '',
      guarantor1Address: '',
      guarantor2FullName: '',
      guarantor2Phone: '',
      guarantor2NationalId: '',
      guarantor2Relationship: '',
      guarantor2Address: '',
      loanType: '',
      loanAmount: '',
      loanPurpose: '',
      loanTerm: '',
      employmentStatus: '',
      employerName: '',
      monthlyIncome: '',
      hasCollateral: false,
      collateralType: '',
      collateralValue: '',
      collateralDescription: '',
      agreeToTerms: false,
    },
  });
  
  // Update the form with the generated loan ID
  useEffect(() => {
    if (loanId) {
      form.setValue('loanIdentificationNumber', loanId);
    }
  }, [loanId, form]);
  
  const hasCollateral = form.watch('hasCollateral');
  
  const regenerateLoanId = () => {
    const newLoanId = generateLoanIdentificationNumber();
    setLoanId(newLoanId);
    form.setValue('loanIdentificationNumber', newLoanId);
    
    toast({
      title: "Loan ID Regenerated",
      description: `New loan ID: ${newLoanId}`,
    });
  };
  
  const onSubmit = async (data: LoanFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', data);
      
      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully.",
      });
      
      // Reset form
      form.reset();
      setActiveTab('personal');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigation functions
  const nextTab = (currentTab: string) => {
    switch (currentTab) {
      case 'identification':
        setActiveTab('personal');
        break;
      case 'personal':
        setActiveTab('guarantors');
        break;
      case 'guarantors':
        setActiveTab('loan');
        break;
      case 'loan':
        setActiveTab('employment');
        break;
      case 'employment':
        setActiveTab('collateral');
        break;
      case 'collateral':
        setActiveTab('documents');
        break;
      case 'documents':
        setActiveTab('review');
        break;
      default:
        break;
    }
  };
  
  const prevTab = (currentTab: string) => {
    switch (currentTab) {
      case 'guarantors':
        setActiveTab('personal');
        break;
      case 'loan':
        setActiveTab('guarantors');
        break;
      case 'employment':
        setActiveTab('loan');
        break;
      case 'collateral':
        setActiveTab('employment');
        break;
      case 'documents':
        setActiveTab('collateral');
        break;
      case 'review':
        setActiveTab('documents');
        break;
      default:
        break;
    }
  };
  
  // Document handlers
  const handleDocumentUpload = async (file: File, documentType: string): Promise<void> => {
    return new Promise((resolve) => {
      // Simulate upload process
      setTimeout(() => {
        console.log(`${documentType} uploaded:`, file.name);
        
        // Create a new uploaded file object
        const newFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          id: `${documentType}-${Date.now()}` // Generate a temporary ID
        };
        
        // Add the file to the appropriate state based on document type
        switch (documentType) {
          case 'id_document':
            setNationalIdDocuments(prev => [...prev, newFile]);
            break;
          case 'collateral_photo':
            setCollateralDocuments(prev => [...prev, newFile]);
            break;
          case 'proof_of_income':
            setIncomeDocuments(prev => [...prev, newFile]);
            break;
          case 'guarantor1_id':
            setGuarantor1Documents(prev => [...prev, newFile]);
            break;
          case 'guarantor2_id':
            setGuarantor2Documents(prev => [...prev, newFile]);
            break;
        }
        
        toast({
          title: "Document Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
        
        resolve();
      }, 1500);
    });
  };

  const handleDeleteDocument = async (fileId: string, documentType: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Remove the file from the appropriate state based on document type
        switch (documentType) {
          case 'id_document':
            setNationalIdDocuments(prev => prev.filter(doc => doc.id !== fileId));
            break;
          case 'collateral_photo':
            setCollateralDocuments(prev => prev.filter(doc => doc.id !== fileId));
            break;
          case 'proof_of_income':
            setIncomeDocuments(prev => prev.filter(doc => doc.id !== fileId));
            break;
          case 'guarantor1_id':
            setGuarantor1Documents(prev => prev.filter(doc => doc.id !== fileId));
            break;
          case 'guarantor2_id':
            setGuarantor2Documents(prev => prev.filter(doc => doc.id !== fileId));
            break;
        }
        
        toast({
          title: "Document Deleted",
          description: "The document has been removed.",
        });
        
        resolve();
      }, 500);
    });
  };

  // Handler functions for specific document types
  const handleNationalIdUpload = async (file: File): Promise<void> => {
    return handleDocumentUpload(file, 'id_document');
  };
  
  const handleCollateralUpload = async (file: File): Promise<void> => {
    return handleDocumentUpload(file, 'collateral_photo');
  };
  
  const handleIncomeDocUpload = async (file: File): Promise<void> => {
    return handleDocumentUpload(file, 'proof_of_income');
  };
  
  const handleGuarantor1Upload = async (file: File): Promise<void> => {
    return handleDocumentUpload(file, 'guarantor1_id');
  };
  
  const handleGuarantor2Upload = async (file: File): Promise<void> => {
    return handleDocumentUpload(file, 'guarantor2_id');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-8 mb-8">
            <TabsTrigger value="identification">Identification</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
            <TabsTrigger value="loan">Loan Details</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="collateral">Collateral</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>
          
          {/* Loan Identification Tab */}
          <TabsContent value="identification" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Loan Identification</h2>
              <p className="text-gray-500 mb-6">Each loan is assigned a unique identification number for tracking and reference.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Loan Identification Number</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={regenerateLoanId}
                      title="Generate New ID"
                      className="h-8 w-8"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>This unique ID will be used to track your loan application</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="loanIdentificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="text-lg font-mono bg-gray-50 dark:bg-gray-800"
                            readOnly 
                          />
                        </FormControl>
                        <FormDescription>
                          Format: LN-YYYY-MM-XXXXX (Year-Month-Sequence)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button type="button" onClick={() => nextTab('identification')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
              <p className="text-gray-500 mb-6">Please provide your personal details for the loan application.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+256 700 000000" {...field} />
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
                      <Input placeholder="CM12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Residential Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('personal')}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => nextTab('personal')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* New Guarantors Tab */}
          <TabsContent value="guarantors" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Guarantors Information</h2>
              <p className="text-gray-500 mb-6">Please provide details for two guarantors who can vouch for your loan.</p>
            </div>
            
            <FormSection title="Guarantor 1" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="guarantor1FullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarantor1Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+256 700 000000" {...field} />
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
                      <Input placeholder="CM12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarantor1Relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Applicant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="family">Family Member</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Work Colleague</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarantor1Address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Residential Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter guarantor's full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormSection title="Guarantor 2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="guarantor2FullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarantor2Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+256 700 000000" {...field} />
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
                      <Input placeholder="CM12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarantor2Relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Applicant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="family">Family Member</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Work Colleague</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarantor2Address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Residential Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter guarantor's full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('guarantors')}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => nextTab('guarantors')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* Loan Details Tab */}
          <TabsContent value="loan" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Loan Details</h2>
              <p className="text-gray-500 mb-6">Please provide details about the loan you're applying for.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="loanType"
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
                        <SelectItem value="business">Business Loan</SelectItem>
                        <SelectItem value="mortgage">Mortgage</SelectItem>
                        <SelectItem value="agricultural">Agricultural Loan</SelectItem>
                        <SelectItem value="education">Education Loan</SelectItem>
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
                      <Input type="number" placeholder="5,000,000" {...field} />
                    </FormControl>
                    <FormDescription>Enter amount in Ugandan Shillings</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="loanTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="loanPurpose"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Loan Purpose</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe how you plan to use this loan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('loan')}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => nextTab('loan')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* Employment Details Tab */}
          <TabsContent value="employment" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Employment Information</h2>
              <p className="text-gray-500 mb-6">Please provide details about your employment and income.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormDescription>Leave blank if self-employed</FormDescription>
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
                      <Input type="number" placeholder="1,500,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('employment')}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => nextTab('employment')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* Collateral Tab */}
          <TabsContent value="collateral" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Collateral Information</h2>
              <p className="text-gray-500 mb-6">Please provide details about any collateral you're offering for this loan.</p>
            </div>
            
            <FormField
              control={form.control}
              name="hasCollateral"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I have collateral to offer for this loan</FormLabel>
                    <FormDescription>
                      Providing collateral may improve your chances of approval and interest rates
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {hasCollateral && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormField
                  control={form.control}
                  name="collateralType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select collateral type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="business-assets">Business Assets</SelectItem>
                          <SelectItem value="savings">Savings/Deposits</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="collateralValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value (UGX)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10,000,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="collateralDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Collateral Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide details about your collateral" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('collateral')}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => nextTab('collateral')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* Documents Tab - Updated with our new DocumentUpload component */}
          <TabsContent value="documents" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Supporting Documents</h2>
              <p className="text-gray-500 mb-6">Please upload the required documents to support your loan application.</p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Applicant Passport Photo</CardTitle>
                  <CardDescription>Upload a passport-sized photo of the applicant</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload 
                    title="Passport Photo"
                    documentType="passport_photo"
                    onUpload={handleNationalIdUpload}
                    isUploading={false}
                    iconType="user"
                    enableCapture={true}
                    isPrintable={true}
                    isPrintReady={form.getValues('fullName') !== '' && form.getValues('nationalId') !== ''}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">National ID</CardTitle>
                  <CardDescription>Upload a clear scan or photo of your National ID (front and back)</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload 
                    title="National ID Document"
                    documentType="id_document"
                    onUpload={handleNationalIdUpload}
                    isUploading={false}
                    iconType="id"
                    enableCapture={true} 
                    enableScanning={true}
                    uploadedFiles={nationalIdDocuments}
                    onDelete={(id) => handleDeleteDocument(id, 'id_document')}
                    isPrintable={true}
                    isPrintReady={form.getValues('fullName') !== '' && form.getValues('nationalId') !== ''}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proof of Income</CardTitle>
                  <CardDescription>Upload your recent payslips or bank statements</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload 
                    title="Proof of Income"
                    documentType="loan_agreement"
                    onUpload={handleIncomeDocUpload}
                    isUploading={false}
                    uploadedFiles={incomeDocuments}
                    onDelete={(id) => handleDeleteDocument(id, 'proof_of_income')}
                    isPrintable={true}
                    isPrintReady={form.getValues('monthlyIncome') !== ''}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Guarantor 1 Documents</CardTitle>
                  <CardDescription>Upload documents for first guarantor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <DocumentUpload 
                      title="Guarantor 1 Passport Photo"
                      documentType="guarantor1_photo"
                      onUpload={handleGuarantor1Upload}
                      isUploading={false}
                      iconType="user"
                      enableCapture={true}
                      isPrintable={true}
                      isPrintReady={form.getValues('guarantor1FullName') !== '' && form.getValues('guarantor1NationalId') !== ''}
                    />
                    
                    <DocumentUpload 
                      title="Guarantor 1 ID"
                      documentType="id_document"
                      onUpload={handleGuarantor1Upload}
                      isUploading={false}
                      iconType="id"
                      enableCapture={true}
                      enableScanning={true}
                      uploadedFiles={guarantor1Documents.filter(doc => doc.documentType === 'id_document')}
                      onDelete={(id) => handleDeleteDocument(id, 'guarantor1_id')}
                      isPrintable={true}
                      isPrintReady={form.getValues('guarantor1FullName') !== '' && form.getValues('guarantor1NationalId') !== ''}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Guarantor 2 Documents</CardTitle>
                  <CardDescription>Upload documents for second guarantor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <DocumentUpload 
                      title="Guarantor 2 Passport Photo"
                      documentType="guarantor2_photo"
                      onUpload={handleGuarantor2Upload}
                      isUploading={false}
                      iconType="user"
                      enableCapture={true}
                      isPrintable={true}
                      isPrintReady={form.getValues('guarantor2FullName') !== '' && form.getValues('guarantor2NationalId') !== ''}
                    />
                    
                    <DocumentUpload 
                      title="Guarantor 2 ID"
                      documentType="id_document"
                      onUpload={handleGuarantor2Upload}
                      isUploading={false}
                      iconType="id"
                      enableCapture={true}
                      enableScanning={true}
                      uploadedFiles={guarantor2Documents.filter(doc => doc.documentType === 'id_document')}
                      onDelete={(id) => handleDeleteDocument(id, 'guarantor2_id')}
                      isPrintable={true}
                      isPrintReady={form.getValues('guarantor2FullName') !== '' && form.getValues('guarantor2NationalId') !== ''}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {hasCollateral && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Collateral Documents</CardTitle>
                    <CardDescription>Upload documents proving ownership of your collateral</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload 
                      title="Collateral Documents"
                      documentType="collateral_photo"
                      onUpload={handleCollateralUpload}
                      isUploading={false}
                      iconType="photo"
                      enableCapture={true}
                      uploadedFiles={collateralDocuments}
                      onDelete={(id) => handleDeleteDocument(id, 'collateral_photo')}
                      isPrintable={true}
                      isPrintReady={form.getValues('hasCollateral') && form.getValues('collateralType') !== ''}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('documents')}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => nextTab('documents')}>
                Next Step
              </Button>
            </div>
          </TabsContent>
          
          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Review Your Application</h2>
              <p className="text-gray-500 mb-6">Please review your information before submitting your loan application.</p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Loan Identification</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div>
                    <span className="font-medium">Loan ID:</span> {form.getValues('loanIdentificationNumber')}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Full Name:</span> {form.getValues('fullName')}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {form.getValues('email')}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {form.getValues('phone')}
                  </div>
                  <div>
                    <span className="font-medium">National ID:</span> {form.getValues('nationalId')}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Address:</span> {form.getValues('address')}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Loan Type:</span> {form.getValues('loanType')}
                  </div>
                  <div>
                    <span className="font-medium">Loan Amount:</span> UGX {form.getValues('loanAmount')}
                  </div>
                  <div>
                    <span className="font-medium">Loan Term:</span> {form.getValues('loanTerm')} months
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Loan Purpose:</span> {form.getValues('loanPurpose')}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employment Status:</span> {form.getValues('employmentStatus')}
                  </div>
                  <div>
                    <span className="font-medium">Employer:</span> {form.getValues('employerName') || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Monthly Income:</span> UGX {form.getValues('monthlyIncome')}
                  </div>
                </CardContent>
              </Card>
              
              {hasCollateral && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Collateral Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Collateral Type:</span> {form.getValues('collateralType')}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Value:</span> UGX {form.getValues('collateralValue')}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Description:</span> {form.getValues('collateralDescription')}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I agree to the terms and conditions</FormLabel>
                      <FormDescription>
                        By submitting this application, I confirm that all information provided is accurate and complete.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => prevTab('review')}>
                Previous Step
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default LoanApplicationForm;
