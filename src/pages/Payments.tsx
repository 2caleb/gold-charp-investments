
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Calendar, DollarSign, CreditCard, ChevronRight, PieChart, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Payments = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const showToast = () => {
    toast({
      title: "Payments Feature",
      description: "This feature is coming soon. Check back later!",
    });
  };

  // Sample data for the payment overview
  const upcomingPayments = [
    { id: 1, date: "May 25, 2025", amount: "UGX 2,500,000", status: "Pending" },
    { id: 2, date: "June 25, 2025", amount: "UGX 2,500,000", status: "Scheduled" },
    { id: 3, date: "July 25, 2025", amount: "UGX 2,500,000", status: "Scheduled" },
  ];

  const recentPayments = [
    { id: 1, date: "April 25, 2025", amount: "UGX 2,500,000", status: "Completed" },
    { id: 2, date: "March 25, 2025", amount: "UGX 2,500,000", status: "Completed" },
  ];

  return (
    <Layout>
      <section className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 md:py-16 min-h-screen transition-all duration-500">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-400 dark:to-blue-200">
                  Payment Center
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                  Manage your loan repayments and track payment history.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button onClick={showToast} className="bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Make a Payment
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8 animate-fade-in">
              {/* Payment Summary Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-2xl">
                    <PieChart className="h-6 w-6 text-blue-600 mr-2" />
                    Payment Summary
                  </CardTitle>
                  <CardDescription>Current loan repayment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-700 dark:text-blue-400 font-medium mb-1 text-sm">Next Payment</p>
                      <p className="text-2xl font-bold mb-1">UGX 2,500,000</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> May 25, 2025
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-400 font-medium mb-1 text-sm">Total Paid</p>
                      <p className="text-2xl font-bold mb-1">UGX 5,000,000</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> 2 payments made
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                      <p className="text-purple-700 dark:text-purple-400 font-medium mb-1 text-sm">Remaining Balance</p>
                      <p className="text-2xl font-bold mb-1">UGX 42,500,000</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> 17 payments remaining
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Payments */}
              <Card className="border-0 shadow-lg transition-all bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    Upcoming Payments
                  </CardTitle>
                  <CardDescription>Your next scheduled payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingPayments.map((payment) => (
                          <tr key={payment.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="py-3 px-4">{payment.date}</td>
                            <td className="py-3 px-4 font-medium">{payment.amount}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                payment.status === "Pending" 
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" 
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" onClick={showToast} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                Pay Now
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-8 animate-fade-in">
              <Card className="border-0 shadow-lg transition-all bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Payment History
                  </CardTitle>
                  <CardDescription>All your completed payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Payment Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.map((payment) => (
                          <tr key={payment.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="py-3 px-4">{payment.date}</td>
                            <td className="py-3 px-4 font-medium">{payment.amount}</td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" onClick={showToast} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule" className="animate-fade-in">
              <Card className="border-0 shadow-lg transition-all bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    Amortization Schedule
                  </CardTitle>
                  <CardDescription>Complete breakdown of your loan repayment plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loan Amount</p>
                        <p className="text-lg font-bold">UGX 50,000,000</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Interest Rate</p>
                        <p className="text-lg font-bold">18% per annum</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loan Term</p>
                        <p className="text-lg font-bold">20 months</p>
                      </div>
                    </div>
                    
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="h-10 w-10 text-blue-700 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">View Detailed Schedule</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Access your complete payment schedule with principal and interest breakdown for each payment
                      </p>
                      <Button onClick={showToast} className="bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all">
                        Download Full Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-8 p-6 border-0">
            <h3 className="text-xl font-medium mb-6">Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">Mobile Money</CardTitle>
                  <CardDescription>Pay using MTN or Airtel Money</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send payment to our registered number and get instant confirmation.
                  </p>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button onClick={showToast} variant="outline" className="w-full">Select</Button>
                </div>
              </Card>
              
              <Card className="h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">Bank Transfer</CardTitle>
                  <CardDescription>Make a direct bank deposit</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transfer funds to our bank account and upload your deposit slip.
                  </p>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button onClick={showToast} variant="outline" className="w-full">Select</Button>
                </div>
              </Card>
              
              <Card className="h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">Debit/Credit Card</CardTitle>
                  <CardDescription>Pay with your card online</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Secure payment using Visa, Mastercard or any other major card.
                  </p>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button onClick={showToast} variant="outline" className="w-full">Select</Button>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-gray-400">
              For payment assistance, please contact our support team at 
              <a href="mailto:support@goldcharp.com" className="text-blue-600 dark:text-blue-400 ml-1 hover:underline">
                support@goldcharp.com
              </a>
              {' '}or call 
              <a href="tel:+256-393103974" className="text-blue-600 dark:text-blue-400 ml-1 hover:underline">
                +256-393103974
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Payments;
