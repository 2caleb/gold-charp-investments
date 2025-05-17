
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Calendar, DollarSign, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const { toast } = useToast();
  
  const showToast = () => {
    toast({
      title: "Payments Feature",
      description: "This feature is coming soon. Check back later!",
    });
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 md:py-16 transition-all duration-500">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-400 dark:to-blue-200">
              Payment Schedule
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              View and manage your loan repayment schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>View your next scheduled payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={showToast} className="w-full">View Schedule</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your past payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={showToast} className="w-full">View History</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>Pay your next installment now</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={showToast} className="w-full">Pay Now</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500">
              For payment assistance, please contact support at 
              <a href="mailto:support@goldcharp.com" className="text-blue-600 ml-1 hover:underline">
                support@goldcharp.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Payments;
