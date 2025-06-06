
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const UgandanMortgageCalculator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [principal, setPrincipal] = useState(100000000); // 100M UGX default
  const [rate, setRate] = useState(16); // 16% typical Ugandan rate
  const [term, setTerm] = useState(20); // 20 years default
  const [insurance, setInsurance] = useState(0);
  const [tax, setTax] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculatePayment = () => {
    const r = rate / 100 / 12; // Monthly interest rate
    const n = term * 12; // Total number of payments
    const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
    const totalMonthly = payment + insurance + tax;
    setMonthlyPayment(totalMonthly);
    return totalMonthly;
  };

  const saveCalculation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your calculations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payment = calculatePayment();
      const { error } = await supabase.from("mortgage_calculations").insert([
        {
          user_id: user.id,
          principal,
          interest_rate: rate,
          term_years: term,
          insurance,
          tax,
          monthly_payment: payment,
        },
      ]);

      if (error) {
        console.error("Error saving data:", error);
        toast({
          title: "Error Saving Calculation",
          description: "There was an error saving your calculation. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Calculation Saved",
          description: "Your mortgage calculation has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculatePayment();
  }, [principal, rate, term, insurance, tax]);

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="bg-purple-700 text-white rounded-t-lg">
          <CardTitle>Ugandan Mortgage Calculator</CardTitle>
          <CardDescription className="text-purple-100">
            Calculate your estimated monthly mortgage payment in Ugandan Shillings (UGX)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Loan Principal Input */}
          <div className="space-y-2">
            <Label htmlFor="principal">Loan Principal (UGX)</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="text-lg"
              placeholder="100,000,000"
            />
            <p className="text-sm text-gray-500">
              Current value: {formatCurrency(principal)}
            </p>
          </div>

          {/* Interest Rate Input */}
          <div className="space-y-2">
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="text-lg"
              placeholder="16.0"
            />
            <p className="text-sm text-gray-500">
              Typical Ugandan mortgage rates: 14% - 20%
            </p>
          </div>

          {/* Loan Term Input */}
          <div className="space-y-2">
            <Label htmlFor="term">Loan Term (Years)</Label>
            <Input
              id="term"
              type="number"
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="text-lg"
              placeholder="20"
            />
            <p className="text-sm text-gray-500">
              Common terms: 15, 20, 25, or 30 years
            </p>
          </div>

          {/* Insurance Input */}
          <div className="space-y-2">
            <Label htmlFor="insurance">Monthly Insurance (UGX)</Label>
            <Input
              id="insurance"
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(Number(e.target.value))}
              className="text-lg"
              placeholder="0"
            />
            <p className="text-sm text-gray-500">
              Property insurance premium per month
            </p>
          </div>

          {/* Property Tax Input */}
          <div className="space-y-2">
            <Label htmlFor="tax">Monthly Property Tax (UGX)</Label>
            <Input
              id="tax"
              type="number"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="text-lg"
              placeholder="0"
            />
            <p className="text-sm text-gray-500">
              Local government property tax per month
            </p>
          </div>

          {/* Results */}
          <Card className="bg-gray-50 border-purple-100">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Monthly Payment Estimate</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-2">
                  {formatCurrency(monthlyPayment)}
                </div>
                <div className="text-sm text-gray-600">
                  Principal & Interest: {formatCurrency(monthlyPayment - insurance - tax)}
                </div>
                {(insurance > 0 || tax > 0) && (
                  <div className="text-sm text-gray-600 mt-1">
                    + Insurance: {formatCurrency(insurance)} + Tax: {formatCurrency(tax)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-gray-500 italic">
            Note: This is an estimate. Actual rates and terms may vary based on your credit profile and lender requirements.
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => calculatePayment()}>
            Recalculate
          </Button>
          <Button 
            className="bg-purple-700 hover:bg-purple-800" 
            onClick={saveCalculation}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Calculation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UgandanMortgageCalculator;
