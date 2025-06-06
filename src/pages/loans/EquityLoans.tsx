
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

const EquityLoansPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <Link to="/loans" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Loans
          </Link>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">Home Equity Options</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Leverage your home's value with flexible home equity solutions designed to meet your financial needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <CardTitle>Home Equity Line of Credit (HELOC)</CardTitle>
                </div>
                <CardDescription>Flexible access to funds with variable rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Draw period of 10 years</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Access funds as needed, like a credit card</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Starting at Prime + 0.5%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Pay interest only on what you use</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Borrow up to 85% of home value</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/calculator" className="w-full">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Available Credit</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Fixed Rate</div>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Banknote className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                  <CardTitle>Home Equity Loan</CardTitle>
                </div>
                <CardDescription>Lump sum with stable, predictable monthly payments</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Terms from 5-20 years</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Fixed interest rate for predictable payments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Starting at 4.25% APR</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Receive all funds at once</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Perfect for one-time large expenses</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/calculator" className="w-full">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800">Calculate Monthly Payment</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-bold mb-6 dark:text-white">Common Uses for Home Equity</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mb-3">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Home Improvements</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kitchen remodels, bathroom upgrades, additions</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg mb-3">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Debt Consolidation</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pay off high-interest credit cards and loans</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg mb-3">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">Education</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">College tuition and educational expenses</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg mb-3">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300">Investment</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real estate investments and business ventures</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Unlock Your Home's Potential</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our home equity specialists will help you determine how much equity you have available and which option is best for your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-purple-700 hover:bg-purple-800">Speak to a Specialist</Button>
              </Link>
              <Link to="/property-evaluation">
                <Button variant="outline">Check Home Value</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EquityLoansPage;
