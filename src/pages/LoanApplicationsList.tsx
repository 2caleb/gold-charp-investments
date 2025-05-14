
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import DataCollectionButton from '@/components/loans/DataCollectionButton';

const LoanApplicationsList = () => {
  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Loan Applications</h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                View and manage all loan applications. Click on an application to see its details.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <DataCollectionButton />
              <Button className="bg-purple-700 hover:bg-purple-800" asChild>
                <Link to="/">
                  <FilePlus className="mr-2 h-4 w-4" />
                  New Application
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No loan applications found. Start by creating a new application or collecting client data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoanApplicationsList;
