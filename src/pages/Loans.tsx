
import React from 'react';
import Layout from '@/components/layout/Layout';
import LoansTabs from '@/components/loans/LoansTabs';

const Loans = () => {
  return (
    <Layout>
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Loan Options</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                Gold Charp Investments Limited offers flexible financing solutions to help you achieve your property goals.
              </p>
            </div>
          </div>
          
          <LoansTabs />
        </div>
      </section>
    </Layout>
  );
};

export default Loans;
