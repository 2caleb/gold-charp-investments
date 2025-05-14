
import React from 'react';
import Layout from '@/components/layout/Layout';
import LoanApplicationForm from '@/components/loans/LoanApplicationForm';

const NewLoanApplication = () => {
  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 dark:text-white">New Loan Application</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Fill out the form below to submit a new loan application.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            <LoanApplicationForm />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewLoanApplication;
