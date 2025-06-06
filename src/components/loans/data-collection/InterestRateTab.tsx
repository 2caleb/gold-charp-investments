
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface InterestRateTabProps {
  onCompleteOnboarding: () => void;
}

export const InterestRateTab: React.FC<InterestRateTabProps> = ({
  onCompleteOnboarding
}) => {
  const [interestRate, setInterestRate] = useState<number>(18);
  
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
            <h3 className="text-xl font-semibold mb-4 font-serif text-gray-800 dark:text-gray-200">Client Declarations</h3>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800 transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                By proceeding, the client confirms that all information provided is accurate and complete to the best of their knowledge. 
                The client authorizes the bank to verify all information provided, including credit history and employment verification.
                The interest rate of {formatInterestRate(interestRate)} has been clearly communicated and acknowledged by the client.
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
