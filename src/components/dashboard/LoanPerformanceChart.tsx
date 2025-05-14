
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Loan Performance</CardTitle>
          <CardDescription>Overview of loan disbursements, repayments, and defaults</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `UGX ${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="disbursed" name="Disbursed" fill="#8884d8" />
                <Bar dataKey="repaid" name="Repaid" fill="#82ca9d" />
                <Bar dataKey="defaulted" name="Defaulted" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700">
              UGX {data.reduce((sum, item) => sum + item.disbursed, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              UGX {data.reduce((sum, item) => sum + item.repaid, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Default Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const totalDefaulted = data.reduce((sum, item) => sum + item.defaulted, 0);
              const totalDisbursed = data.reduce((sum, item) => sum + item.disbursed, 0);
              const defaultRate = totalDisbursed ? (totalDefaulted / totalDisbursed) * 100 : 0;
              return (
                <p className={`text-3xl font-bold ${defaultRate > 10 ? 'text-red-600' : 'text-amber-500'}`}>
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
