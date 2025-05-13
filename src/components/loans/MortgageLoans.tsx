
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MortgageLoans = () => {
  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Mortgage Loan Options</h2>
        <p className="text-gray-600 mb-8">
          Our mortgage solutions are designed to make homeownership accessible and affordable. 
          With competitive rates and flexible terms, we help you find the perfect financing option for your dream home.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Popular</div>
            <CardHeader>
              <CardTitle>Fixed Rate Mortgage</CardTitle>
              <CardDescription>
                Predictable payments for the life of your loan
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
                  <span>Locked-in interest rate for entire term</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Starting at 3.25% APR</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>No surprises - same payment every month</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/calculator" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Payment</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Adjustable Rate Mortgage</CardTitle>
              <CardDescription>
                Lower initial rates that may adjust over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Terms: 5/1, 7/1, 10/1 ARM options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Initial fixed-rate period followed by adjustable rate</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Starting at 2.75% APR</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Ideal for those who may move within a few years</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/calculator" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Payment</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">Need personalized assistance?</h3>
        <p className="text-gray-600 mb-6">
          Our mortgage specialists can help you find the perfect loan solution for your unique situation.
        </p>
        <Link to="/contact">
          <Button className="bg-purple-700 hover:bg-purple-800">Speak to a Mortgage Specialist</Button>
        </Link>
      </div>
    </div>
  );
};

export default MortgageLoans;
