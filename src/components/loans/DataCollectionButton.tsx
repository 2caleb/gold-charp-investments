
import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Download, UserPlus, FileText, Check, X, RotateCw, Printer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';

interface LoanCalculationDisplayProps {
  loanAmount?: number;
  interestRate?: number;
  loanTerm?: number;
}

const LoanCalculationDisplay: React.FC<LoanCalculationDisplayProps> = ({ loanAmount, interestRate, loanTerm }) => {
  const calculateMonthlyPayment = useCallback(() => {
    if (!loanAmount || !interestRate || !loanTerm) return 0;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;
    return (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
  }, [loanAmount, interestRate, loanTerm]);

  const monthlyPayment = calculateMonthlyPayment();

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Loan Calculation</h3>
      <p>Loan Amount: ${loanAmount || 0}</p>
      <p>Interest Rate: {interestRate || 0}%</p>
      <p>Loan Term: {loanTerm || 0} months</p>
      <p>Monthly Payment: ${monthlyPayment.toFixed(2) || 0}</p>
    </div>
  );
};

interface DataCollectionButtonProps {
  onDataCollected: (data: any) => void;
}

export const DataCollectionButton: React.FC<DataCollectionButtonProps> = ({ onDataCollected }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [loanAmount, setLoanAmount] = useState<number | undefined>(undefined);
  const [interestRate, setInterestRate] = useState<number | undefined>(undefined);
  const [loanTerm, setLoanTerm] = useState<number | undefined>(undefined);
  const [guarantor1FullName, setGuarantor1FullName] = useState('');
  const [guarantor1IdNumber, setGuarantor1IdNumber] = useState('');
  const [guarantor2FullName, setGuarantor2FullName] = useState('');
  const [guarantor2IdNumber, setGuarantor2IdNumber] = useState('');
  const [loanId, setLoanId] = useState<string>(generateLoanIdentificationNumber());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isPrintable, setIsPrintable] = useState(false);

  useEffect(() => {
    if (
      firstName && 
      lastName && 
      idNumber && 
      loanAmount && 
      loanTerm && 
      guarantor1FullName && 
      guarantor1IdNumber && 
      guarantor2FullName && 
      guarantor2IdNumber
    ) {
      setIsPrintable(true);
    } else {
      setIsPrintable(false);
    }
  }, [firstName, lastName, idNumber, loanAmount, loanTerm, guarantor1FullName, guarantor1IdNumber, guarantor2FullName, guarantor2IdNumber]);

  const handlePrint = useCallback(() => {
    if (isPrintable) {
      window.print();
    }
  }, [isPrintable]);

  const handleDataCollection = () => {
    if (!firstName || !lastName || !idNumber || !loanAmount || !loanTerm || !guarantor1FullName || !guarantor1IdNumber || !guarantor2FullName || !guarantor2IdNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      firstName,
      lastName,
      idNumber,
      loanAmount,
      loanTerm,
      guarantor1FullName,
      guarantor1IdNumber,
      guarantor2FullName,
      guarantor2IdNumber,
    };
    onDataCollected(data);
    setOpen(false);
    toast({
      title: "Success",
      description: "Data collected successfully.",
    });
  };

  const handleRegenerateLoanId = () => {
    const newLoanId = generateLoanIdentificationNumber();
    setLoanId(newLoanId);
    toast({
      title: "Loan ID Regenerated",
      description: `New loan ID: ${newLoanId}`,
    });
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadedFiles(prev => [...prev, file]);
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Collect Client Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1024px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Collect Client Data</DialogTitle>
            <DialogDescription>
              Enter client details and loan information
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              disabled={!isPrintable}
              className={`${!isPrintable ? 'opacity-30 cursor-not-allowed' : ''}`}
              title={isPrintable ? "Print document" : "Complete the form to enable printing"}
            >
              <Printer className="h-5 w-5" />
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <div className="flex flex-col space-y-1 mb-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="loanIdentificationNumber">Loan ID</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={handleRegenerateLoanId}
                >
                  <RotateCw className="h-3 w-3 mr-1" /> Regenerate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="loanIdentificationNumber"
                  value={loanId}
                  readOnly
                  className="bg-gray-50 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder="Enter ID number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="flex flex-col space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <Input
                  type="number"
                  id="loanAmount"
                  placeholder="Enter loan amount"
                  value={loanAmount === undefined ? '' : loanAmount.toString()}
                  onChange={(e) => setLoanAmount(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  type="number"
                  id="interestRate"
                  placeholder="Enter interest rate"
                  value={interestRate === undefined ? '' : interestRate.toString()}
                  onChange={(e) => setInterestRate(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loanTerm">Loan Term (Months)</Label>
                <Input
                  type="number"
                  id="loanTerm"
                  placeholder="Enter loan term in months"
                  value={loanTerm === undefined ? '' : loanTerm.toString()}
                  onChange={(e) => setLoanTerm(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-2">Guarantor 1 Details</h3>
            <div className="flex flex-col space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="guarantor1FullName">Full Name</Label>
                <Input
                  id="guarantor1FullName"
                  placeholder="Enter guarantor 1 full name"
                  value={guarantor1FullName}
                  onChange={(e) => setGuarantor1FullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guarantor1IdNumber">ID Number</Label>
                <Input
                  id="guarantor1IdNumber"
                  placeholder="Enter guarantor 1 ID number"
                  value={guarantor1IdNumber}
                  onChange={(e) => setGuarantor1IdNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-2">Guarantor 2 Details</h3>
            <div className="flex flex-col space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="guarantor2FullName">Full Name</Label>
                <Input
                  id="guarantor2FullName"
                  placeholder="Enter guarantor 2 full name"
                  value={guarantor2FullName}
                  onChange={(e) => setGuarantor2FullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guarantor2IdNumber">ID Number</Label>
                <Input
                  id="guarantor2IdNumber"
                  placeholder="Enter guarantor 2 ID number"
                  value={guarantor2IdNumber}
                  onChange={(e) => setGuarantor2IdNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Supporting Documents</h3>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="client">Client Documents</TabsTrigger>
              <TabsTrigger value="guarantor1">Guarantor 1</TabsTrigger>
              <TabsTrigger value="guarantor2">Guarantor 2</TabsTrigger>
            </TabsList>
            
            <TabsContent value="client" className="space-y-4 p-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Passport Photo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      title="Client Passport Photo"
                      documentType="passport_photo"
                      onUpload={(file) => handleFileUpload(file, 'passport_photo')}
                      isUploading={isUploading}
                      iconType="user"
                      enableCapture={true}
                      isPrintable={true}
                      isPrintReady={firstName !== '' && lastName !== ''}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">National ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      title="ID Document"
                      documentType="id_document"
                      onUpload={(file) => handleFileUpload(file, 'id_document')}
                      isUploading={isUploading}
                      iconType="id"
                      enableCapture={true}
                      enableScanning={true}
                      isPrintable={true}
                      isPrintReady={firstName !== '' && lastName !== ''}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="guarantor1" className="space-y-4 p-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Guarantor 1 Passport Photo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      title="Guarantor 1 Passport Photo"
                      documentType="guarantor1_photo"
                      onUpload={(file) => handleFileUpload(file, 'guarantor1_photo')}
                      isUploading={isUploading}
                      iconType="user"
                      enableCapture={true}
                      isPrintable={true}
                      isPrintReady={guarantor1FullName !== ''}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Guarantor 1 ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      title="Guarantor 1 ID Document"
                      documentType="id_document"
                      onUpload={(file) => handleFileUpload(file, 'guarantor1_id')}
                      isUploading={isUploading}
                      iconType="id"
                      enableCapture={true}
                      enableScanning={true}
                      isPrintable={true}
                      isPrintReady={guarantor1FullName !== ''}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="guarantor2" className="space-y-4 p-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Guarantor 2 Passport Photo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      title="Guarantor 2 Passport Photo"
                      documentType="guarantor2_photo"
                      onUpload={(file) => handleFileUpload(file, 'guarantor2_photo')}
                      isUploading={isUploading}
                      iconType="user"
                      enableCapture={true}
                      isPrintable={true}
                      isPrintReady={guarantor2FullName !== ''}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Guarantor 2 ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      title="Guarantor 2 ID Document"
                      documentType="id_document"
                      onUpload={(file) => handleFileUpload(file, 'guarantor2_id')}
                      isUploading={isUploading}
                      iconType="id"
                      enableCapture={true}
                      enableScanning={true}
                      isPrintable={true}
                      isPrintReady={guarantor2FullName !== ''}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <LoanCalculationDisplay loanAmount={loanAmount} interestRate={interestRate} loanTerm={loanTerm} />

        <div className="flex justify-end mt-4">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDataCollection} className="ml-2">
            Collect Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

useEffect(() => {
  // Add print styles
  const style = document.createElement('style');
  style.id = 'print-styles';
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    // Cleanup
    const styleElem = document.getElementById('print-styles');
    if (styleElem) styleElem.remove();
  };
}, []);
