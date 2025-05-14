
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

// Define data format
interface LoanPerformanceData {
  month: string;
  disbursed: number;
  repaid: number;
  defaulted: number;
}

export const LoanPerformanceChart = () => {
  const [data, setData] = useState<LoanPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoanPerformance = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a query to Supabase
        // For now, we'll use mock data
        const mockData: LoanPerformanceData[] = [
          { month: 'Jan', disbursed: 4000, repaid: 2400, defaulted: 240 },
          { month: 'Feb', disbursed: 3000, repaid: 1398, defaulted: 210 },
          { month: 'Mar', disbursed: 5000, repaid: 3800, defaulted: 290 },
          { month: 'Apr', disbursed: 2780, repaid: 3908, defaulted: 200 },
          { month: 'May', disbursed: 1890, repaid: 4800, defaulted: 181 },
          { month: 'Jun', disbursed: 2390, repaid: 3800, defaulted: 250 },
          { month: 'Jul', disbursed: 3490, repaid: 4300, defaulted: 210 },
        ];
        setData(mockData);
      } catch (err) {
        console.error('Error fetching loan performance data:', err);
        setError('Failed to load loan performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanPerformance();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
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
