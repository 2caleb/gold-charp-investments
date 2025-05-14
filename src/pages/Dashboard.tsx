
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoanPerformanceChart } from '@/components/dashboard/LoanPerformanceChart';
import { PropertyInsights } from '@/components/dashboard/PropertyInsights';
import { FieldOfficerActivity } from '@/components/dashboard/FieldOfficerActivity';
import { RiskProfileMap } from '@/components/dashboard/RiskProfileMap';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('loan-performance');

  // Authentication check
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to access the dashboard",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Analytics Dashboard</h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Track loan performance, property sales, field officer activity, and risk profiles across locations.
            </p>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="loan-performance">Loan Performance</TabsTrigger>
              <TabsTrigger value="property-insights">Property Insights</TabsTrigger>
              <TabsTrigger value="field-officer-activity">Field Officer Activity</TabsTrigger>
              <TabsTrigger value="risk-profile">Risk Profiling</TabsTrigger>
            </TabsList>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
              <TabsContent value="loan-performance" className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Loan Performance Tracking</h2>
                <Separator className="my-4" />
                <LoanPerformanceChart />
              </TabsContent>

              <TabsContent value="property-insights" className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Property Sales Insights</h2>
                <Separator className="my-4" />
                <PropertyInsights />
              </TabsContent>

              <TabsContent value="field-officer-activity" className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Field Officer Activity Logs</h2>
                <Separator className="my-4" />
                <FieldOfficerActivity />
              </TabsContent>

              <TabsContent value="risk-profile" className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Risk Profiling by Location</h2>
                <Separator className="my-4" />
                <RiskProfileMap />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
