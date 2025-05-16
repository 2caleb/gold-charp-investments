
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApplicationForm from '@/components/loans/LoanApplicationForm';
import { Button } from '@/components/ui/button';
import { BarChart3, ClipboardList } from 'lucide-react';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';

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
                Fill out the form below to submit a new loan application. Each application receives a unique identification number for tracking.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Button variant="outline" asChild className="flex items-center">
                <Link to="/loan-applications">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Applications
                </Link>
              </Button>
              <Button variant="default" asChild className="bg-purple-700 hover:bg-purple-800">
                <Link to="/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <LoanApplicationForm />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewLoanApplication;
