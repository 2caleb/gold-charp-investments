
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MortgageLoansPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <Link to="/loans" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Loans
          </Link>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">Mortgage Loan Options</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Compare our comprehensive mortgage solutions designed to help you purchase your dream home with competitive rates and flexible terms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Most Popular</div>
              <CardHeader>
                <CardTitle>Fixed Rate Mortgage</CardTitle>
                <CardDescription>Predictable payments for the life of your loan</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Terms of 15, 20, or 30 years available</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Locked-in interest rate for entire term</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Starting at 3.25% APR</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>No payment surprises - same amount every month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Down payment as low as 5%</span>
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
                <CardTitle>Adjustable Rate Mortgage (ARM)</CardTitle>
                <CardDescription>Lower initial rates that may adjust over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Terms: 5/1, 7/1, 10/1 ARM options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Initial fixed-rate period followed by adjustable rate</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Starting at 2.75% APR</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Ideal for those who may move within a few years</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Rate caps protect against dramatic increases</span>
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

          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Ready to Get Started?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our mortgage specialists are ready to help you find the perfect loan solution for your unique situation and guide you through the entire process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-purple-700 hover:bg-purple-800">Speak to a Specialist</Button>
              </Link>
              <Link to="/new-loan-application">
                <Button variant="outline">Apply Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MortgageLoansPage;
