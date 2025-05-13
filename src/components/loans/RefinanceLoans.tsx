
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefinanceLoans = () => {
  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Refinancing Options</h2>
        <p className="text-gray-600 mb-8">
          Refinancing your current mortgage could help you lower your monthly payment, reduce your interest rate, 
          or access your home's equity for other financial needs.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate & Term Refinance</CardTitle>
              <CardDescription>
                Lower your rate or change your loan term
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Terms of 15, 20, or 30 years</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Potentially save thousands over the life of your loan</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Starting at 3.0% APR</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Reduce your monthly payment or pay off your loan faster</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/calculator" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Savings</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Best Value</div>
            <CardHeader>
              <CardTitle>Cash-Out Refinance</CardTitle>
              <CardDescription>
                Access your home's equity for major expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Borrow against your home's equity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Use funds for home improvements, education, or debt consolidation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Loan-to-value up to 80%</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Often lower rates than personal loans or credit cards</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/calculator" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Equity</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RefinanceLoans;
