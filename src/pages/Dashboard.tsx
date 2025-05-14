
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
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { showDatabaseNotAvailableToast } from '@/components/ui/notification-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('loan-performance');
  const [tablesExist, setTablesExist] = useState(true);
  const [checkingTables, setCheckingTables] = useState(true);

  // Check for required tables
  useEffect(() => {
    const checkTables = async () => {
      setCheckingTables(true);
      try {
        // Check loan_applications table
        const { count: loanCount, error: loanError } = await supabase
          .from('loan_applications')
          .select('*', { count: 'exact', head: true });
          
        if (loanError) {
          console.log('loan_applications table not found');
          setTablesExist(false);
          showDatabaseNotAvailableToast();
        }
      } catch (err) {
        console.error('Error checking tables:', err);
        setTablesExist(false);
      } finally {
        setCheckingTables(false);
      }
    };
    
    checkTables();
  }, []);

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

  if (checkingTables) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-700 mr-2" />
          <span>Checking database connection...</span>
        </div>
      </Layout>
    );
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

          {!tablesExist && (
            <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Using demonstration data</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  This dashboard is currently showing demonstration data. To connect to real data, you'll need to set up the appropriate tables in your Supabase database.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-500 text-amber-700"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  Open Supabase Console
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
