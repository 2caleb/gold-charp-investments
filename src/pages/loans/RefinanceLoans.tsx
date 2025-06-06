
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, TrendingDown, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefinanceLoansPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <Link to="/loans" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Loans
          </Link>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">Refinancing Options</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Lower your payments, reduce your interest rate, or access your home's equity with our comprehensive refinancing solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Best Value</div>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <CardTitle>Rate & Term Refinance</CardTitle>
                </div>
                <CardDescription>Lower your rate or change your loan term</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Terms of 15, 20, or 30 years</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Potentially save thousands over the life of your loan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Starting at 3.0% APR</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Reduce monthly payment or pay off faster</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>No cash required at closing</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/calculator" className="w-full">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Savings</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                  <CardTitle>Cash-Out Refinance</CardTitle>
                </div>
                <CardDescription>Access your home's equity for major expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Borrow against your home's equity</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Use funds for home improvements, education, or debt consolidation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Loan-to-value up to 80%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Often lower rates than personal loans or credit cards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Tax benefits may apply (consult your tax advisor)</span>
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

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Why Refinance with Gold Charp?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2 dark:text-white">Lower Rates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Take advantage of today's competitive rates</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2 dark:text-white">Fast Process</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Streamlined approval in as little as 30 days</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold mb-2 dark:text-white">No Hidden Fees</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transparent pricing with no surprises</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Ready to Refinance?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our refinancing experts will help you determine if refinancing is right for you and guide you through every step of the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-purple-700 hover:bg-purple-800">Get Free Quote</Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline">Calculate Savings</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RefinanceLoansPage;
