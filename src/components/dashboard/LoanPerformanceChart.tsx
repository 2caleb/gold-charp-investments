
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { fetchLoanPerformanceData, getMockLoanPerformanceData } from '@/services/dashboardService';
import { toast } from '@/hooks/use-toast';

// Define data format
interface LoanPerformanceData {
  month: string;
  disbursed: number;
  repaid: number;
  defaulted: number;
}

export const LoanPerformanceChart = () => {
  console.log("LoanPerformanceChart component rendering");
  const [data, setData] = useState<LoanPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("LoanPerformanceChart useEffect running");
    const loadLoanPerformance = async () => {
      setIsLoading(true);
      try {
        // Check if the table exists
        const { count, error: tableCheckError } = await supabase
          .from('loan_applications')
          .select('*', { count: 'exact', head: true });

        if (tableCheckError) {
          console.log('Using mock data - loan_applications table not available', tableCheckError);
          // Use mock data if table doesn't exist
          setData(getMockLoanPerformanceData());
          return;
        }

        if (count === 0) {
          // Table exists but no data
          console.log('Using mock data - no records in loan_applications');
          setData(getMockLoanPerformanceData());
          return;
        }

        // Table exists and has data, fetch real data
        const { data: loanData, error } = await fetchLoanPerformanceData();
        
        if (error) throw error;
        
        if (loanData && loanData.length > 0) {
          console.log("Setting real loan data:", loanData.length, "items");
          setData(loanData);
        } else {
          // No data processed, use mock data
          console.log('Using mock data - no processed data available');
          setData(getMockLoanPerformanceData());
        }
      } catch (err) {
        console.error('Error loading loan performance data:', err);
        setError('Failed to load loan performance data');
        // Fallback to mock data
        setData(getMockLoanPerformanceData());
        toast({
          title: 'Data Loading Error',
          description: 'Using sample data while we fix the issue.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLoanPerformance();
  }, []);

  console.log("LoanPerformanceChart render state:", { isLoading, dataLength: data.length, error });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
        <span className="ml-3 text-gray-600">Loading performance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Monthly Loan Performance</CardTitle>
          <CardDescription className="text-sm">Overview of loan disbursements, repayments, and defaults</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, '']}
                  labelStyle={{ fontSize: '12px' }}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="disbursed" name="Disbursed" fill="#8884d8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="repaid" name="Repaid" fill="#82ca9d" radius={[2, 2, 0, 0]} />
                <Bar dataKey="defaulted" name="Defaulted" fill="#ff8042" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Total Disbursed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl lg:text-3xl font-bold text-purple-700 truncate">
              UGX {data.reduce((sum, item) => sum + item.disbursed, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl lg:text-3xl font-bold text-green-600 truncate">
              UGX {data.reduce((sum, item) => sum + item.repaid, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Default Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const totalDefaulted = data.reduce((sum, item) => sum + item.defaulted, 0);
              const totalDisbursed = data.reduce((sum, item) => sum + item.disbursed, 0);
              const defaultRate = totalDisbursed ? (totalDefaulted / totalDisbursed) * 100 : 0;
              return (
                <p className={`text-2xl lg:text-3xl font-bold truncate ${defaultRate > 10 ? 'text-red-600' : 'text-amber-500'}`}>
                  {defaultRate.toFixed(2)}%
                </p>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
