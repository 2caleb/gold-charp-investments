
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, BadgeDollarSign, ScrollText } from 'lucide-react';
import MortgageLoans from './MortgageLoans';
import RefinanceLoans from './RefinanceLoans';
import BusinessLoans from './BusinessLoans';

const LoansTabs = () => {
  return (
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
  );
};

export default LoansTabs;
