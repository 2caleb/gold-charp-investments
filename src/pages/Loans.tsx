
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { CheckCircle, Landmark, BadgeDollarSign, ScrollText } from 'lucide-react';

const Loans = () => {
  return (
    <Layout>
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Loan Options</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gold Charp Investments Limited offers flexible financing solutions to help you achieve your property goals.
            </p>
          </div>

          <Tabs defaultValue="mortgage" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="mortgage" className="flex items-center gap-2">
                <Landmark size={18} />
                Mortgage Loans
              </TabsTrigger>
              <TabsTrigger value="refinance" className="flex items-center gap-2">
                <BadgeDollarSign size={18} />
                Refinancing
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <ScrollText size={18} />
                Business Loans
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mortgage">
              <div className="space-y-10">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-purple-700">Mortgage Loan Options</h2>
                  <p className="text-gray-600 mb-8">
                    Our mortgage solutions are designed to make homeownership accessible and affordable. 
                    With competitive rates and flexible terms, we help you find the perfect financing option for your dream home.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="relative overflow-hidden">
                      <Badge className="absolute top-4 right-4 bg-green-500">Popular</Badge>
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
            </TabsContent>
            
            <TabsContent value="refinance">
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
                      <Badge className="absolute top-4 right-4 bg-green-500">Best Value</Badge>
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
            </TabsContent>
            
            <TabsContent value="business">
              <div className="space-y-10">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-purple-700">Business Loan Options</h2>
                  <p className="text-gray-600 mb-8">
                    Fuel your business growth with our flexible financing solutions designed specifically for 
                    Nigerian entrepreneurs and business owners.
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
                            <span>Loan amounts from ₦5 million to ₦500 million</span>
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
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Loans;
