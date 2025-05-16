
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApplicationForm from '@/components/loans/LoanApplicationForm';
import { Button } from '@/components/ui/button';
import { BarChart3, ClipboardList, MapPin } from 'lucide-react';
import RiskProfileMap from '@/components/dashboard/RiskProfileMap';

const NewLoanApplication = () => {
  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">New Loan Application</h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                Fill out the form below to submit a new loan application. If you have collateral, you'll be able to add supporting documents.
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <LoanApplicationForm />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-red-500" />
                Geographical Risk Distribution
              </h2>
              <div className="h-96">
                <RiskProfileMap />
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                The map shows loan risk assessment based on geographical location.
                Darker regions indicate higher risk areas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewLoanApplication;
