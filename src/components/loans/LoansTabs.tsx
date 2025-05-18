
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MortgageLoans from './MortgageLoans';
import RefinanceLoans from './RefinanceLoans';
import BusinessLoans from './BusinessLoans';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FileText, ClipboardCheck, ArrowRight, Users } from 'lucide-react';

const LoansTabs = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDataCollectionClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to login to access this feature.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      navigate('/staff/data-collection');
    }
  };

  return (
    <div className="space-y-8">
      {isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <FileText className="mr-2" /> Client Data Collection Process
          </h3>
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our client onboarding process follows a structured workflow to ensure thorough evaluation and approval:
            </p>
            
            <div className="relative">
              {/* Process flow visualization */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                <div className="flex flex-col items-center text-center mb-6 md:mb-0">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                    <ClipboardCheck className="h-8 w-8 text-purple-700 dark:text-purple-300" />
                  </div>
                  <h4 className="font-medium">Field Officer</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Data Collection</p>
                </div>
                
                <ArrowRight className="hidden md:block text-gray-400 dark:text-gray-600" />
                
                <div className="flex flex-col items-center text-center mb-6 md:mb-0">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                    <Users className="h-8 w-8 text-blue-700 dark:text-blue-300" />
                  </div>
                  <h4 className="font-medium">Manager</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Initial Review</p>
                </div>
                
                <ArrowRight className="hidden md:block text-gray-400 dark:text-gray-600" />
                
                <div className="flex flex-col items-center text-center mb-6 md:mb-0">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                    <Users className="h-8 w-8 text-indigo-700 dark:text-indigo-300" />
                  </div>
                  <h4 className="font-medium">Director</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk Assessment</p>
                </div>
                
                <ArrowRight className="hidden md:block text-gray-400 dark:text-gray-600" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                    <Users className="h-8 w-8 text-green-700 dark:text-green-300" />
                  </div>
                  <h4 className="font-medium">CEO</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Final Approval</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleDataCollectionClick}
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg py-3"
            >
              <FileText className="mr-2" size={18} />
              Collect Client Data
            </Button>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mortgage">Mortgage Loans</TabsTrigger>
          <TabsTrigger value="refinance">Refinance Options</TabsTrigger>
          <TabsTrigger value="business">Business Loans</TabsTrigger>
        </TabsList>
        <TabsContent value="mortgage">
          <MortgageLoans />
        </TabsContent>
        <TabsContent value="refinance">
          <RefinanceLoans />
        </TabsContent>
        <TabsContent value="business">
          <BusinessLoans />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoansTabs;
