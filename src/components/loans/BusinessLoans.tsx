
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessLoans = () => {
  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Business Loan Options</h2>
        <p className="text-gray-600 mb-8">
          Fuel your business growth with our flexible financing solutions designed specifically for 
          Ugandan entrepreneurs and business owners.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Real Estate Loans</CardTitle>
              <CardDescription>
                Finance your business property purchase or improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Flexible terms up to 25 years</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Finance up to 75% of property value</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Competitive interest rates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Available for various property types including office, retail, industrial</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/contact" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">Request Consultation</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Expansion Loans</CardTitle>
              <CardDescription>
                Fund your business growth and expansion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Loan amounts from UGX 15 million to UGX 1.5 billion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Repayment terms from 1 to 7 years</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Use for equipment purchase, working capital, or expansion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Fast application process with minimal documentation</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/contact" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">Apply Now</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">Looking for a customized business loan solution?</h3>
        <p className="text-gray-600 mb-6">
          Our business financing specialists can help you find the right funding solution for your company's unique needs.
        </p>
        <Link to="/contact">
          <Button className="bg-purple-700 hover:bg-purple-800">Speak to a Business Loan Specialist</Button>
        </Link>
      </div>
    </div>
  );
};

export default BusinessLoans;
