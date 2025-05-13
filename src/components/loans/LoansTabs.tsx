
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, BadgeDollarSign, ScrollText, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MortgageLoans from './MortgageLoans';
import RefinanceLoans from './RefinanceLoans';
import BusinessLoans from './BusinessLoans';

const LoansTabs = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user has staff role
  const isStaff = () => {
    if (!user?.user_metadata?.role) return false;
    return ['field_officer', 'manager', 'director', 'ceo'].includes(user.user_metadata.role);
  };
  
  const handleDataCollectionClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to login to access this feature.",
        variant: "destructive",
      });
      navigate('/login');
    } else if (!isStaff()) {
      toast({
        title: "Staff Access Only",
        description: "You need to have staff permissions to access this feature.",
        variant: "destructive",
      });
    } else {
      navigate('/staff/data-collection');
    }
  };

  return (
    <>
      {/* Staff Data Collection Button - Only visible if user is authenticated */}
      {isAuthenticated && (
        <div className="mb-8 flex justify-end">
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
      
      <Tabs defaultValue="mortgage" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="mortgage" className="flex items-center gap-2">
            <Landmark size={18} />
            Mortgage Loans
          </TabsTrigger>
          <TabsTrigger value="refinance" className="flex items-center gap-2">
            <BadgeDollarSign size={18} />
            Refinancing
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <ScrollText size={18} />
            Business Loans
          </TabsTrigger>
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
    </>
  );
};

export default LoansTabs;
