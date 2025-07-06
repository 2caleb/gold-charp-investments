
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/currencyUtils';

interface InterestRateTabProps {
  onCompleteOnboarding: () => void;
}

export const InterestRateTab: React.FC<InterestRateTabProps> = ({
  onCompleteOnboarding
}) => {
  const [interestRate, setInterestRate] = useState<number>(18);
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('');
  
  // Fetch loan book data for completion estimates
  const { data: loanBookData } = useQuery({
    queryKey: ['loan-book-live-completion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching loan book data:', error);
        return [];
      }
      return data || [];
    },
  });

  // Calculate estimated completion based on portfolio performance
  useEffect(() => {
    if (loanBookData && loanBookData.length > 0) {
      const avgCollectionRate = loanBookData.reduce((sum, loan) => {
        const totalPaid = Object.keys(loan)
          .filter(key => key.includes('-') && key.includes('2025'))
          .reduce((paymentSum, dateKey) => {
            const payment = loan[dateKey];
            // Handle both null and <nil> string representations from Supabase
            const isValidPayment = payment !== null && 
                                 payment !== undefined && 
                                 payment !== '<nil>' &&
                                 payment !== 'null' &&
                                 typeof payment === 'number' && 
                                 payment > 0;
            return paymentSum + (isValidPayment ? payment : 0);
          }, 0);
        
        const collectionRate = loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
        return sum + collectionRate;
      }, 0) / loanBookData.length;
      
      // Estimate completion time based on collection rate and interest rate
      const estimatedMonths = avgCollectionRate > 0 ? Math.ceil(12 / (avgCollectionRate / 100)) : 12;
      const completionDate = new Date();
      completionDate.setMonth(completionDate.getMonth() + estimatedMonths);
      setEstimatedCompletion(completionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }
  }, [loanBookData]);
  
  // Interest rate formatter
  const formatInterestRate = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card className="mb-6 border-0 shadow-md transform transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 font-serif text-gray-800 dark:text-gray-200">Interest Rate Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="col-span-3">
                  <Slider
                    value={[interestRate]}
                    min={1}
                    max={30}
                    step={0.25}
                    onValueChange={(values) => setInterestRate(values[0])}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-2">
                    <span>1%</span>
                    <span>7.5%</span>
                    <span>15%</span>
                    <span>22.5%</span>
                    <span>30%</span>
                  </div>
                </div>
                <div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center transition-all duration-200 hover:border-blue-300">
                    <Label htmlFor="interest-rate-display" className="text-sm text-gray-500 block mb-2">Annual Interest Rate</Label>
                    <Input
                      id="interest-rate-display"
                      value={formatInterestRate(interestRate)}
                      readOnly
                      className="text-2xl font-bold text-center text-blue-700 bg-transparent border-0 p-0 h-auto focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 font-serif text-gray-800 dark:text-gray-200">Loan Performance Insights</h3>
            {loanBookData && loanBookData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <Label className="text-sm font-medium text-green-800 dark:text-green-200">Portfolio Performance</Label>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {loanBookData.length} Active Loans
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Estimated Completion</Label>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {estimatedCompletion || 'Calculating...'}
                  </p>
                </div>
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-4 font-serif text-gray-800 dark:text-gray-200">Client Declarations</h3>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800 transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                By proceeding, the client confirms that all information provided is accurate and complete to the best of their knowledge. 
                The client authorizes the bank to verify all information provided, including credit history and employment verification.
                The interest rate of {formatInterestRate(interestRate)} has been clearly communicated and acknowledged by the client.
                {estimatedCompletion && (
                  <span className="block mt-2 font-medium">
                    Based on current portfolio performance, estimated loan completion date is {estimatedCompletion}.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <Button 
            onClick={onCompleteOnboarding} 
            className="bg-blue-700 hover:bg-blue-800 text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Complete Onboarding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
