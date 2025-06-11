
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApplicationForm from '@/components/loans/LoanApplicationForm';
import { Button } from '@/components/ui/button';
import { BarChart3, ClipboardList, UserPlus, Calendar, Table, FileText, Shield, Clock, Building } from 'lucide-react';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { DataCollectionButton } from '@/components/loans/data-collection/DataCollectionButton';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLoanApplicationForm } from '@/hooks/use-loan-application-form';

const NewLoanApplication = () => {
  // Force desktop view for better UX
  useDesktopRedirect();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use the real loan application form hook
  const {
    handleSubmit,
    isSubmitting,
    clients,
    isLoadingClients,
    submissionError
  } = useLoanApplicationForm();

  const handleDataCollected = (data: any) => {
    toast({
      title: "Data Collection Complete",
      description: `Client data for ${data.full_name || 'New Client'} has been successfully collected.`,
    });
    // Redirect to loan applications list after data collection
    setTimeout(() => navigate('/loan-applications'), 1500);
  };

  const onFormSubmit = async (data: any) => {
    console.log("Submitting loan application:", data);
    
    try {
      const result = await handleSubmit(data);
      
      if (result) {
        toast({
          title: "Application Submitted Successfully",
          description: "Your loan application has been submitted and is now in the approval workflow.",
        });
        
        // Navigate to the workflow page for this application
        navigate(`/loan-applications/${result.id}`);
      }
    } catch (error: any) {
      console.error("Application submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit loan application. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 md:py-20 transition-all duration-500">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-400 dark:to-blue-200">New Loan Application</h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                Fill out the form below to submit a new loan application or use the client onboarding process for a guided experience.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-4 animate-fade-in">
              <DataCollectionButton onDataCollected={handleDataCollected} />
              
              <Button variant="outline" asChild className="flex items-center transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Link to="/loan-applications">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Applications
                </Link>
              </Button>
              
              <Button variant="default" asChild className="bg-blue-700 hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <Link to="/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 transition-all duration-300 hover:shadow-lg hover:border-blue-300 transform hover:translate-y-[-5px]">
              <CardContent className="p-8">
                <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-700 w-16 h-16 flex items-center justify-center mb-6">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Client Onboarding</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Complete guided client onboarding with document collection
                </p>
                <DataCollectionButton onDataCollected={handleDataCollected} />
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-300 transform hover:translate-y-[-5px]">
              <CardContent className="p-8">
                <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600 w-16 h-16 flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Loan Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Manage required documentation for loan approval
                </p>
                <Button variant="outline" asChild className="w-full transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Link to="/documents">View Documents</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-300 transform hover:translate-y-[-5px]">
              <CardContent className="p-8">
                <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600 w-16 h-16 flex items-center justify-center mb-6">
                  <Calendar className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Payment Schedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  View loan repayment schedules and options
                </p>
                <Button variant="outline" asChild className="w-full transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Link to="/payments">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-300 transform hover:translate-y-[-5px]">
              <CardContent className="p-8">
                <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600 w-16 h-16 flex items-center justify-center mb-6">
                  <Table className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Loan Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Track portfolio performance and insights
                </p>
                <Button variant="outline" asChild className="w-full transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Link to="/dashboard">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto max-w-6xl animate-fade-in">
            {submissionError && (
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 text-sm">{submissionError}</p>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
              <div className="p-8 md:p-10 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-t-2xl">
                <h2 className="text-3xl font-serif font-bold flex items-center text-blue-900 dark:text-blue-400 mb-4">
                  <FileText className="mr-3 h-6 w-6 text-blue-700 dark:text-blue-500" />
                  Loan Application Form
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Complete all required fields for your loan request
                </p>
              </div>
              <div className="p-8 md:p-12">
                <LoanApplicationForm 
                  onSubmit={onFormSubmit}
                  isSubmitting={isSubmitting}
                  clients={clients}
                  isLoadingClients={isLoadingClients}
                />
              </div>
            </div>
            
            <div className="mt-12 p-8 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900/50 dark:to-transparent rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-medium mb-6">Additional Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button variant="outline" asChild className="flex items-center justify-center py-8 px-6 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10">
                  <Link to="/services/insurance">
                    <Shield className="h-6 w-6 mr-3 text-blue-700" />
                    <span className="text-base">Insurance Options</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex items-center justify-center py-8 px-6 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10">
                  <Link to="/services/fast-track">
                    <Clock className="h-6 w-6 mr-3 text-blue-700" />
                    <span className="text-base">Fast Track Approval</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex items-center justify-center py-8 px-6 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10">
                  <Link to="/services/business-support">
                    <Building className="h-6 w-6 mr-3 text-blue-700" />
                    <span className="text-base">Business Support</span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need assistance? Contact our support team at <a href="mailto:info@goldcharpinvestments.com" className="text-blue-600 hover:underline transition-all duration-200">info@goldcharpinvestments.com</a> or call us at +256-393103974
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewLoanApplication;
