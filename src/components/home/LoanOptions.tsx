
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

const LoanOptions = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Loan Options</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our flexible financing solutions designed to fit your needs
          </p>
        </div>

        <Tabs defaultValue="mortgage" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mortgage">Mortgage Loans</TabsTrigger>
            <TabsTrigger value="refinance">Refinancing</TabsTrigger>
            <TabsTrigger value="equity">Home Equity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mortgage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mortgage Loan Options</CardTitle>
                <CardDescription>
                  Find the perfect mortgage solution for your new home purchase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 relative">
                    <Badge className="absolute top-2 right-2 bg-green-500">Popular</Badge>
                    <h4 className="font-semibold text-lg mb-1">Fixed Rate Mortgage</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Stable payments with locked-in interest rates for the life of your loan.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Terms:</span> 15, 20, 30 years
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 3.25% APR
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-1">Adjustable Rate Mortgage</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Lower initial rates that may adjust over time based on market conditions.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Terms:</span> 5/1, 7/1, 10/1 ARM
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 2.75% APR
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-1">FHA Loans</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Government-backed loans with lower down payment requirements.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Down Payment:</span> As low as 3.5%
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 3.5% APR
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-1">VA Loans</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Special options for veterans and active military personnel.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Down Payment:</span> 0% possible
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 3.0% APR
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/calculator">
                  <Button variant="outline">Calculate Payment</Button>
                </Link>
                <Link to="/loans/mortgage">
                  <Button>Compare All Options</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="refinance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Refinancing Options</CardTitle>
                <CardDescription>
                  Lower your payments or cash out equity with our refinancing solutions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 relative">
                    <Badge className="absolute top-2 right-2 bg-green-500">Best Value</Badge>
                    <h4 className="font-semibold text-lg mb-1">Rate & Term Refinance</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Lower your interest rate or change your loan term.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Terms:</span> 15, 20, 30 years
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 3.0% APR
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-1">Cash-Out Refinance</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Access your home's equity for major expenses or investments.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Max LTV:</span> Up to 80%
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 3.25% APR
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/calculator">
                  <Button variant="outline">Calculate Savings</Button>
                </Link>
                <Link to="/loans/refinance">
                  <Button>Explore Refinancing</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="equity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Home Equity Options</CardTitle>
                <CardDescription>
                  Leverage your home's value with flexible home equity solutions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-1">Home Equity Line of Credit</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Flexible access to funds with variable rates.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Draw Period:</span> 10 years
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> Prime + 0.5%
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 relative">
                    <Badge className="absolute top-2 right-2 bg-blue-700">Fixed Rate</Badge>
                    <h4 className="font-semibold text-lg mb-1">Home Equity Loan</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Lump sum with stable, predictable monthly payments.
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Terms:</span> 5-20 years
                      </div>
                      <div>
                        <span className="font-medium">Starting at:</span> 4.25% APR
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/calculator">
                  <Button variant="outline">Calculate Equity</Button>
                </Link>
                <Link to="/loans/equity">
                  <Button>Learn More</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default LoanOptions;
