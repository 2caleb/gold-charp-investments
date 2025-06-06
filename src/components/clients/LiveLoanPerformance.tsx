
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface LiveLoanData {
  id: string;
  client_name: string;
  amount_returnable: number;
  amount_paid_1: number;
  amount_paid_2: number;
  amount_paid_3: number;
  amount_paid_4: number;
  remaining_balance: number;
  loan_date: string;
  status: string;
  payment_mode: string;
}

interface LiveLoanPerformanceProps {
  clientName: string;
}

const LiveLoanPerformance: React.FC<LiveLoanPerformanceProps> = ({ clientName }) => {
  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['client-loan-performance', clientName],
    queryFn: async (): Promise<LiveLoanData[]> => {
      console.log('Fetching loan performance for client:', clientName);
      
      // First try exact match
      let { data, error } = await supabase
        .from('loan_book_live')
        .select('*')
        .eq('client_name', clientName)
        .order('loan_date', { ascending: false });

      // If no exact match, try case-insensitive and trimmed match
      if (!data || data.length === 0) {
        console.log('No exact match found, trying case-insensitive search...');
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('loan_book_live')
          .select('*')
          .ilike('client_name', `%${clientName.trim()}%`)
          .order('loan_date', { ascending: false });
        
        data = fuzzyData;
        error = fuzzyError;
      }

      if (error) {
        console.error('Error fetching loan performance:', error);
        throw error;
      }

      console.log('Found loan data:', data?.length || 0, 'records');
      return data || [];
    },
    enabled: !!clientName,
  });

  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const calculateTotalPaid = (loan: LiveLoanData): number => {
    return (loan.amount_paid_1 || 0) + 
           (loan.amount_paid_2 || 0) + 
           (loan.amount_paid_3 || 0) + 
           (loan.amount_paid_4 || 0);
  };

  const calculateRepaymentProgress = (loan: LiveLoanData): number => {
    const totalPaid = calculateTotalPaid(loan);
    return loan.amount_returnable > 0 ? (totalPaid / loan.amount_returnable) * 100 : 0;
  };

  const getStatusIcon = (status: string, progress: number) => {
    if (status === 'completed' || progress >= 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'overdue') return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (status: string, progress: number) => {
    if (status === 'completed' || progress >= 100) return 'bg-green-100 text-green-800';
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Live Loan Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Loan Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Unable to load loan performance data.</p>
          <p className="text-xs text-gray-500 mt-2">Search term: "{clientName}"</p>
        </CardContent>
      </Card>
    );
  }

  if (!loanData || loanData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Live Loan Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active loans found for this client</p>
            <p className="text-xs text-gray-400 mt-2">Searched for: "{clientName}"</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const totalLoaned = loanData.reduce((sum, loan) => sum + (loan.amount_returnable || 0), 0);
  const totalPaid = loanData.reduce((sum, loan) => sum + calculateTotalPaid(loan), 0);
  const totalRemaining = loanData.reduce((sum, loan) => sum + (loan.remaining_balance || 0), 0);
  const averageProgress = loanData.length > 0 ? 
    loanData.reduce((sum, loan) => sum + calculateRepaymentProgress(loan), 0) / loanData.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Total Loaned</p>
                <p className="text-sm font-bold">{formatCurrency(totalLoaned)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-sm font-bold">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm font-bold">{formatCurrency(totalRemaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Avg Progress</p>
                <p className="text-sm font-bold">{averageProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Loan Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Live Loan Performance ({loanData.length} loans)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {loanData.map((loan) => {
              const totalPaid = calculateTotalPaid(loan);
              const progress = calculateRepaymentProgress(loan);
              
              return (
                <div key={loan.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(loan.status, progress)}
                      <div>
                        <p className="font-medium">Loan from {new Date(loan.loan_date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Payment Mode: {loan.payment_mode || 'Not specified'}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(loan.status, progress)}>
                      {loan.status || 'Active'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount Returnable</p>
                      <p className="font-bold text-lg">{formatCurrency(loan.amount_returnable || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Paid</p>
                      <p className="font-bold text-lg text-green-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining Balance</p>
                      <p className="font-bold text-lg text-orange-600">{formatCurrency(loan.remaining_balance || 0)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Repayment Progress</span>
                      <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  {/* Payment Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Payment 1</p>
                      <p className="text-sm font-medium">{formatCurrency(loan.amount_paid_1 || 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Payment 2</p>
                      <p className="text-sm font-medium">{formatCurrency(loan.amount_paid_2 || 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Payment 3</p>
                      <p className="text-sm font-medium">{formatCurrency(loan.amount_paid_3 || 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Payment 4</p>
                      <p className="text-sm font-medium">{formatCurrency(loan.amount_paid_4 || 0)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveLoanPerformance;
