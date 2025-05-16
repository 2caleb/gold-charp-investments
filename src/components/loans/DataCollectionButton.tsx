
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Icons
import { FileText, Calculator, Users, UserPlus } from 'lucide-react';

// Utils
import { supabase } from '@/integrations/supabase/client';
import LoanCalculationDisplay from './LoanCalculationDisplay';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

// Define the form schema with Zod
const clientFormSchema = z.object({
  full_name: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  id_number: z.string().min(5, {
    message: "ID number must be at least 5 characters.",
  }),
  phone_number: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  employment_status: z.string().default('employed'),
  monthly_income: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Monthly income must be a number.",
  }),
  notes: z.string().optional(),
});

const calculatorSchema = z.object({
  loanAmount: z.string().min(1, "Loan amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  termMonths: z.string().min(1, "Loan term is required"),
  processingFee: z.string().min(0),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;
type CalculatorFormValues = z.infer<typeof calculatorSchema>;

const DataCollectionButton = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('client-form');
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [currentGuarantor, setCurrentGuarantor] = useState<number>(1);
  const [guarantors, setGuarantors] = useState<any[]>([]);
  const [savedClients, setSavedClients] = useState<any[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [loanId, setLoanId] = useState<string>('');

  useEffect(() => {
    // Generate a loan ID when the component is initialized
    setLoanId(generateLoanIdentificationNumber());
    
    // Fetch existing clients
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const { data, error } = await supabase.from('client_name').select('*');
        if (error) throw error;
        setSavedClients(data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
        toast({
          title: 'Error',
          description: 'Failed to load existing clients.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingClients(false);
      }
    };
    
    fetchClients();
  }, [toast]);

  const formClient = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      id_number: "",
      phone_number: "",
      address: "",
      email: "",
      employment_status: "employed",
      monthly_income: "",
      notes: "",
    },
  });

  const formCalculator = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      loanAmount: "5000000",
      interestRate: "18",
      termMonths: "24",
      processingFee: "2",
    },
  });

  const formGuarantor = useForm({
    defaultValues: {
      full_name: "",
      relationship: "",
      phone_number: "",
      id_number: "",
      address: "",
    },
  });

  const handleClientSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('client_name')
        .insert({
          full_name: values.full_name,
          id_number: values.id_number,
          phone_number: values.phone_number,
          address: values.address || '',
          email: values.email || null,
          employment_status: values.employment_status,
          monthly_income: parseFloat(values.monthly_income),
        })
        .select();

      if (error) throw error;

      toast({
        title: "Client Added",
        description: `${values.full_name} has been added successfully.`,
      });

      // Reset form
      formClient.reset();

      // Add new client to the local state
      if (data) {
        setSavedClients(prev => [...prev, ...data]);
      }

      // Switch to calculator tab
      setActiveTab('calculator');
    } catch (error: any) {
      console.error('Error submitting client data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalculatorSubmit = (values: CalculatorFormValues) => {
    const loanAmount = parseFloat(values.loanAmount);
    const interestRate = parseFloat(values.interestRate);
    const termMonths = parseInt(values.termMonths);
    const processingFee = parseFloat(values.processingFee);
    
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    
    // Monthly payment (PMT formula)
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    // Total payment
    const totalPayment = monthlyPayment * termMonths;
    
    // Processing fee
    const processingFeeAmount = loanAmount * (processingFee / 100);
    
    // Net disbursement
    const netDisbursement = loanAmount - processingFeeAmount;
    
    // Total cost of credit
    const totalCostOfCredit = totalPayment - loanAmount;
    
    const result = {
      monthlyPayment,
      totalPayment,
      processingFeeAmount,
      netDisbursement,
      totalCostOfCredit,
      interestRate,
      termMonths,
      loanAmount,
    };
    
    setCalculationResult(result);
    setActiveTab('calculation-result');
  };

  const handleGuarantorSubmit = (data: any) => {
    setGuarantors(prev => [...prev, {...data, guarantor_number: currentGuarantor}]);
    formGuarantor.reset();
    toast({
      title: "Guarantor Added",
      description: `Guarantor ${currentGuarantor} information has been added.`,
    });
    
    if (currentGuarantor < 2) {
      setCurrentGuarantor(prev => prev + 1);
    } else {
      setActiveTab('client-form');
    }
  };

  const regenerateLoanId = () => {
    const newLoanId = generateLoanIdentificationNumber();
    setLoanId(newLoanId);
    
    toast({
      title: "Loan ID Regenerated",
      description: `New loan ID: ${newLoanId}`,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="bg-purple-700 hover:bg-purple-800">
          <UserPlus className="mr-2 h-4 w-4" />
          Collect Client Data
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Client Data Collection</SheetTitle>
          <SheetDescription>
            Collect client information for loan application processing.
          </SheetDescription>
        </SheetHeader>
        
        {/* Loan Identification Number Display */}
        <div className="my-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <Label htmlFor="loan-id" className="text-sm font-medium">Loan Identification Number</Label>
            <Button 
              onClick={regenerateLoanId} 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
            >
              <FileText className="mr-1 h-3 w-3" />
              Generate New
            </Button>
          </div>
          <div className="mt-1">
            <Input 
              id="loan-id"
              value={loanId}
              readOnly
              className="font-mono bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This ID will be used to track the client's loan application
          </p>
        </div>
        
        <Tabs
          defaultValue="client-form"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="client-form">Client</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
          </TabsList>

          <TabsContent value="client-form" className="space-y-4 mt-4">
            <Form {...formClient}>
              <form onSubmit={formClient.handleSubmit(handleClientSubmit)} className="space-y-4">
                <FormField
                  control={formClient.control}
                  name="full_name"
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={formClient.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="CM12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={formClient.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+256 700 123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={formClient.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={formClient.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Physical address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={formClient.control}
                    name="employment_status"
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
                            <SelectItem value="self-employed">Self-employed</SelectItem>
                            <SelectItem value="business-owner">Business Owner</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={formClient.control}
                    name="monthly_income"
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
                </div>
                
                <FormField
                  control={formClient.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional information" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('guarantors')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add Guarantors
                  </Button>
                  <div className="space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab('calculator')}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculator
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Client"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
            
            {savedClients.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Recent Clients</h4>
                <div className="max-h-40 overflow-y-auto">
                  {savedClients.map((client) => (
                    <div 
                      key={client.id} 
                      className="p-2 border-b hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        formClient.reset({
                          full_name: client.full_name,
                          id_number: client.id_number,
                          phone_number: client.phone_number,
                          address: client.address,
                          email: client.email || '',
                          employment_status: client.employment_status,
                          monthly_income: client.monthly_income.toString(),
                          notes: "",
                        });
                      }}
                    >
                      <div className="font-medium">{client.full_name}</div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>{client.phone_number}</span>
                        <span>{client.id_number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="calculator" className="space-y-4 mt-4">
            <Form {...formCalculator}>
              <form onSubmit={formCalculator.handleSubmit(handleCalculatorSubmit)} className="space-y-4">
                <FormField
                  control={formCalculator.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (UGX)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={formCalculator.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={formCalculator.control}
                    name="termMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Term (Months)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                </div>
                
                <FormField
                  control={formCalculator.control}
                  name="processingFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Fee (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormDescription>
                        This fee is deducted from the loan amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('client-form')}
                  >
                    Back to Client
                  </Button>
                  <Button type="submit">
                    Calculate
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="calculation-result" className="space-y-4 mt-4">
            {calculationResult && (
              <LoanCalculationDisplay result={calculationResult} />
            )}
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('calculator')}
              >
                Back to Calculator
              </Button>
              <SheetClose asChild>
                <Button>Complete</Button>
              </SheetClose>
            </div>
          </TabsContent>
          
          <TabsContent value="guarantors" className="space-y-4 mt-4">
            <form onSubmit={formGuarantor.handleSubmit(handleGuarantorSubmit)} className="space-y-4">
              <h3 className="font-medium">Guarantor {currentGuarantor} Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="g_full_name">Full Name</Label>
                <Input 
                  id="g_full_name" 
                  placeholder="Guarantor name" 
                  {...formGuarantor.register("full_name", { required: "Name is required" })}
                />
                {formGuarantor.formState.errors.full_name && (
                  <p className="text-sm text-red-500">{formGuarantor.formState.errors.full_name.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="g_relationship">Relationship</Label>
                  <Input 
                    id="g_relationship" 
                    placeholder="Relationship to client" 
                    {...formGuarantor.register("relationship", { required: "Relationship is required" })}
                  />
                  {formGuarantor.formState.errors.relationship && (
                    <p className="text-sm text-red-500">{formGuarantor.formState.errors.relationship.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="g_phone_number">Phone Number</Label>
                  <Input 
                    id="g_phone_number" 
                    placeholder="Phone number" 
                    {...formGuarantor.register("phone_number", { required: "Phone number is required" })}
                  />
                  {formGuarantor.formState.errors.phone_number && (
                    <p className="text-sm text-red-500">{formGuarantor.formState.errors.phone_number.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="g_id_number">ID Number</Label>
                <Input 
                  id="g_id_number" 
                  placeholder="ID number" 
                  {...formGuarantor.register("id_number", { required: "ID number is required" })}
                />
                {formGuarantor.formState.errors.id_number && (
                  <p className="text-sm text-red-500">{formGuarantor.formState.errors.id_number.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="g_address">Address</Label>
                <Textarea 
                  id="g_address" 
                  placeholder="Guarantor's address" 
                  {...formGuarantor.register("address", { required: "Address is required" })}
                />
                {formGuarantor.formState.errors.address && (
                  <p className="text-sm text-red-500">{formGuarantor.formState.errors.address.message}</p>
                )}
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveTab('client-form')}
                >
                  Back to Client
                </Button>
                <Button type="submit">
                  {currentGuarantor < 2 ? "Add Guarantor" : "Complete Guarantors"}
                </Button>
              </div>
              
              {/* Show list of added guarantors */}
              {guarantors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Added Guarantors</h4>
                  <div className="space-y-2">
                    {guarantors.map((g, idx) => (
                      <Card key={idx} className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-3">
                          <div className="font-medium">{g.full_name} - Guarantor {g.guarantor_number}</div>
                          <div className="text-sm text-gray-500">{g.relationship} | {g.phone_number}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DataCollectionButton;
