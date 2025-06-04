
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import EnhancedLoanApprovalWorkflow from '@/components/workflow/EnhancedLoanApprovalWorkflow';
import { motion } from 'framer-motion';

const LoanApprovalPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Invalid Application ID</h1>
            <p className="text-gray-600 mt-2">The application ID is missing or invalid.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loan Application Review
          </h1>
          <p className="text-gray-600 mt-2">
            Review and process loan application through the approval workflow
          </p>
        </div>

        <EnhancedLoanApprovalWorkflow applicationId={id} />
      </motion.div>
    </Layout>
  );
};

export default LoanApprovalPage;
