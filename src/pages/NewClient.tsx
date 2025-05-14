
import React from 'react';
import Layout from '@/components/layout/Layout';
import ClientForm from '@/components/clients/ClientForm';

const NewClient = () => {
  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Add New Client</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Enter the client's information to register them in the system.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            <ClientForm />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewClient;
