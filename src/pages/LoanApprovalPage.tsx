
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoanApprovalWorkflow from '@/components/workflow/LoanApprovalWorkflow';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const LoanApprovalPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading: isLoadingPermissions } = useRolePermissions();

  if (isLoadingPermissions) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Loading permissions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link to="/loan-applications">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Applications
              </Link>
            </Button>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Loan Application Review</h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Review and process this loan application according to your role's responsibilities.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
            {id ? (
              <LoanApprovalWorkflow applicationId={id} />
            ) : (
              <p className="text-red-500">No application ID provided.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoanApprovalPage;
