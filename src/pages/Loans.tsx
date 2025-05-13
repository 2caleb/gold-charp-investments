
import React from 'react';
import Layout from '@/components/layout/Layout';
import LoansTabs from '@/components/loans/LoansTabs';
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Loans = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user has staff role
  const isStaff = () => {
    if (!user?.user_metadata?.role) return false;
    return ['field_officer', 'manager', 'director', 'ceo'].includes(user.user_metadata.role);
  };
  
  const handleDataCollectionClick = () => {
    if (isAuthenticated && isStaff()) {
      navigate('/staff/data-collection');
    } else {
      toast({
        title: "Staff Access Only",
        description: "You need to login as a staff member to access this feature.",
        variant: "destructive",
      });
    }
  };
  
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
            
            {/* Staff Data Collection Button - Only visible if user is staff */}
            {isAuthenticated && isStaff() && (
              <div className="mt-6 md:mt-0">
                <Button 
                  onClick={handleDataCollectionClick}
                  variant="outline" 
                  className="flex items-center gap-2 border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50"
                >
                  <FileText size={16} />
                  Client Data Collection
                </Button>
              </div>
            )}
          </div>
          
          <LoansTabs />
        </div>
      </section>
    </Layout>
  );
};

export default Loans;
