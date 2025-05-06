
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MortgageCalculator = () => {
  const { toast } = useToast();
  const [homePrice, setHomePrice] = useState(350000000);
  const [downPayment, setDownPayment] = useState(70000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(3.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate monthly payment when values change
  useEffect(() => {
    calculateMortgage();
  }, [homePrice, downPayment, loanTerm, interestRate]);

  // Handle home price change
  const handleHomePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, '') || '0');
    setHomePrice(value);
    const newDownPaymentValue = Math.round(value * (downPaymentPercent / 100));
    setDownPayment(newDownPaymentValue);
  };

  // Handle down payment change
  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, '') || '0');
    setDownPayment(value);
    const newPercent = Math.round((value / homePrice) * 100);
    setDownPaymentPercent(newPercent > 100 ? 100 : newPercent);
  };

  // Handle down payment percent change
  const handleDownPaymentPercentChange = (values: number[]) => {
    const newPercent = values[0];
    setDownPaymentPercent(newPercent);
    setDownPayment(Math.round(homePrice * (newPercent / 100)));
  };

  // Handle loan term change
  const handleLoanTermChange = (term: number) => {
    setLoanTerm(term);
  };

  // Handle interest rate change
  const handleInterestRateChange = (values: number[]) => {
    setInterestRate(values[0]);
  };

  // Calculate mortgage
  const calculateMortgage = () => {
    try {
      const principal = homePrice - downPayment;
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTerm * 12;
      
      if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
        setMonthlyPayment(0);
        setTotalInterest(0);
        setTotalPayment(0);
        return;
      }

      const x = Math.pow(1 + monthlyRate, numberOfPayments);
      const monthly = (principal * x * monthlyRate) / (x - 1);
      
      const totalPaid = monthly * numberOfPayments;
      const totalInterestPaid = totalPaid - principal;
      
      setMonthlyPayment(monthly);
      setTotalInterest(totalInterestPaid);
      setTotalPayment(totalPaid);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Please check your input values and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="bg-purple-700 text-white rounded-t-lg">
          <CardTitle>Mortgage Calculator</CardTitle>
          <CardDescription className="text-purple-100">
            Calculate your estimated monthly mortgage payment and see a breakdown of costs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Home Price Input */}
          <div className="space-y-2">
            <Label htmlFor="homePrice">Home Price</Label>
            <Input
              id="homePrice"
              type="text"
              value={formatCurrency(homePrice)}
              onChange={handleHomePriceChange}
              className="text-lg"
            />
            <Slider
              defaultValue={[homePrice]}
              min={100000000}
              max={2000000000}
              step={5000000}
              value={[homePrice]}
              onValueChange={(values) => setHomePrice(values[0])}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>UGX 100,000,000</span>
              <span>UGX 2,000,000,000</span>
            </div>
          </div>

          {/* Down Payment Input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="downPayment">Down Payment</Label>
              <span className="text-sm text-gray-500">{downPaymentPercent}%</span>
            </div>
            <Input
              id="downPayment"
              type="text"
              value={formatCurrency(downPayment)}
              onChange={handleDownPaymentChange}
              className="text-lg"
            />
            <Slider
              defaultValue={[downPaymentPercent]}
              min={0}
              max={100}
              step={1}
              value={[downPaymentPercent]}
              onValueChange={handleDownPaymentPercentChange}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Loan Term Input */}
          <div className="space-y-2">
            <Label>Loan Term</Label>
            <div className="grid grid-cols-3 gap-4">
              {[15, 20, 30].map((term) => (
                <Button
                  key={term}
                  variant={loanTerm === term ? "default" : "outline"}
                  onClick={() => handleLoanTermChange(term)}
                  className={`w-full ${loanTerm === term ? 'bg-purple-700 hover:bg-purple-800' : ''}`}
                >
                  {term} Years
                </Button>
              ))}
            </div>
          </div>

          {/* Interest Rate Input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="interestRate">Interest Rate</Label>
              <span className="text-sm text-gray-500">{interestRate}%</span>
            </div>
            <Slider
              defaultValue={[interestRate]}
              min={0.5}
              max={10}
              step={0.125}
              value={[interestRate]}
              onValueChange={handleInterestRateChange}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5%</span>
              <span>10%</span>
            </div>
          </div>

          {/* Results */}
          <Card className="bg-gray-50 border-purple-100">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Results</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Monthly Payment</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(monthlyPayment)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Principal + Interest</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(totalPayment)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Total Interest</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(totalInterest)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-gray-500 italic">
            Note: This calculation is an estimate and does not include property taxes, home insurance, or HOA fees.
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => calculateMortgage()}>Recalculate</Button>
          <Button className="bg-purple-700 hover:bg-purple-800" onClick={() => {
            toast({
              title: "Results Saved",
              description: "Your mortgage calculation results have been saved.",
            });
          }}>Save Results</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MortgageCalculator;
