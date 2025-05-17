
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApplicationForm from '@/components/loans/LoanApplicationForm';
import { Button } from '@/components/ui/button';
import { BarChart3, ClipboardList, UserPlus, Calendar, Table, ChevronRight, FileText } from 'lucide-react';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { DataCollectionButton } from '@/components/loans/DataCollectionButton';
import { Card, CardContent } from '@/components/ui/card';

const NewLoanApplication = () => {
  // Force desktop view for better UX
  useDesktopRedirect();

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">New Loan Application</h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                Fill out the form below to submit a new loan application or use the client onboarding process for a guided experience.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <DataCollectionButton />
              
              <Button variant="outline" asChild className="flex items-center">
                <Link to="/loan-applications">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Applications
                </Link>
              </Button>
              
              <Button variant="default" asChild className="bg-blue-700 hover:bg-blue-800">
                <Link to="/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="rounded-full bg-blue-100 dark:bg-blue-700 w-12 h-12 flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6 text-blue-700 dark:text-blue-100" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">Client Onboarding</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Complete guided client onboarding with document collection
                </p>
                <DataCollectionButton />
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="rounded-full bg-gray-100 dark:bg-gray-700 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">Loan Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Manage required documentation for loan approval
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/documents">View Documents</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="rounded-full bg-gray-100 dark:bg-gray-700 w-12 h-12 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">Payment Schedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  View loan repayment schedules and options
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/payments">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="rounded-full bg-gray-100 dark:bg-gray-700 w-12 h-12 flex items-center justify-center mb-4">
                  <Table className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">Loan Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Track portfolio performance and insights
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/dashboard">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-serif font-bold flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-700" />
                  Loan Application Form
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Complete all required fields for your loan request
                </p>
              </div>
              <LoanApplicationForm />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need assistance? Contact our support team at <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewLoanApplication;
