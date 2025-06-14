
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLiveLoanPerformance } from '@/hooks/use-live-loan-performance';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedLiveLoanPerformanceProps {
  clientName: string;
}

const EnhancedLiveLoanPerformance: React.FC<EnhancedLiveLoanPerformanceProps> = ({ clientName }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  
  const { data: loanData, isLoading, error } = useLiveLoanPerformance(clientName);

  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const getStatusIcon = (status: string, progress: number, recentlyUpdated: boolean) => {
    if (recentlyUpdated) return <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />;
    if (status === 'completed' || progress >= 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'overdue') return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getStatusColor = (status: string, progress: number, recentlyUpdated: boolean) => {
    if (recentlyUpdated) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
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
            Enhanced Live Loan Performance
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </Badge>
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
            Error Loading Live Loan Performance
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
            Enhanced Live Loan Performance
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

  // Smart filtering: separate active and completed loans
  const activeLoans = loanData.filter(loan => !loan.isCompleted);
  const completedLoans = loanData.filter(loan => loan.isCompleted);
  const displayLoans = showCompleted ? loanData : activeLoans;

  // Calculate summary statistics for active loans only
  const activeLoanStats = activeLoans.reduce((stats, loan) => ({
    totalLoaned: stats.totalLoaned + loan.amount_returnable,
    totalPaid: stats.totalPaid + loan.totalPaid,
    totalRemaining: stats.totalRemaining + (loan.remaining_balance || 0)
  }), { totalLoaned: 0, totalPaid: 0, totalRemaining: 0 });

  const averageProgress = activeLoans.length > 0 ? 
    activeLoans.reduce((sum, loan) => sum + loan.progress, 0) / activeLoans.length : 0;

  return (
    <div className="space-y-6">
      {/* Live Status Header */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Zap className="mr-2 h-5 w-5 text-green-600" />
              Enhanced Live Loan Performance
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">
                Real-time Updates
              </Badge>
              {loanData.some(loan => loan.recentlyUpdated) && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-700 animate-pulse">
                  Recently Updated
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center"
              >
                {showCompleted ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide Completed ({completedLoans.length})
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show Completed ({completedLoans.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards - Only for active loans */}
      {activeLoans.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">Active Portfolio</p>
                    <p className="text-sm font-bold">{formatCurrency(activeLoanStats.totalLoaned)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">Total Collected</p>
                    <p className="text-sm font-bold">{formatCurrency(activeLoanStats.totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-orange-700">Outstanding</p>
                    <p className="text-sm font-bold">{formatCurrency(activeLoanStats.totalRemaining)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-700">Avg Progress</p>
                    <p className="text-sm font-bold">{averageProgress.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Detailed Loan Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Loan Details ({displayLoans.length} loans)
            </span>
            {activeLoans.length !== loanData.length && (
              <Badge variant="secondary">
                {completedLoans.length} completed loans
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <div className="space-y-4">
              {displayLoans.map((loan) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`border rounded-lg p-4 space-y-4 transition-all duration-300 ${
                    loan.recentlyUpdated ? 'border-yellow-300 bg-yellow-50 shadow-md' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(loan.status, loan.progress, loan.recentlyUpdated)}
                      <div>
                        <p className="font-medium">Loan from {new Date(loan.loan_date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Payment Mode: {loan.payment_mode || 'Not specified'}</p>
                        {loan.recentlyUpdated && (
                          <p className="text-xs text-yellow-600 font-medium">⚡ Recently updated</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(loan.status, loan.progress, loan.recentlyUpdated)}>
                      {loan.status || 'Active'} {loan.progress >= 100 && '✓'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount Returnable</p>
                      <p className="font-bold text-lg">{formatCurrency(loan.amount_returnable || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Paid</p>
                      <p className="font-bold text-lg text-green-600">{formatCurrency(loan.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining Balance</p>
                      <p className="font-bold text-lg text-orange-600">{formatCurrency(loan.remaining_balance || 0)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Repayment Progress</span>
                      <span className="text-sm font-medium">{loan.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(loan.progress, 100)} className="h-3" />
                  </div>

                  {/* Smart Payment Breakdown - Only show active payments */}
                  {loan.activePayments.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Payment History</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLoanId(expandedLoanId === loan.id ? null : loan.id)}
                        >
                          {expandedLoanId === loan.id ? 'Collapse' : 'Expand'}
                        </Button>
                      </div>
                      
                      <AnimatePresence>
                        {expandedLoanId === loan.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-2"
                          >
                            {loan.activePayments.map((paymentIndex) => {
                              const paymentKey = `amount_paid_${paymentIndex}` as keyof typeof loan;
                              const amount = paymentIndex === 6 ? loan.Amount_paid_6 : 
                                           paymentIndex === 7 ? loan.Amount_paid_7 : 
                                           loan[paymentKey] as number;
                              
                              return (
                                <div key={paymentIndex} className="text-center p-2 bg-gray-50 rounded">
                                  <p className="text-xs text-gray-500">Payment {paymentIndex}</p>
                                  <p className="text-sm font-medium">{formatCurrency(amount || 0)}</p>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLiveLoanPerformance;
