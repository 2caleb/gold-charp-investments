
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSmartLoanCalculations } from '@/hooks/use-smart-loan-calculations';
import { formatCurrency } from '@/utils/currencyUtils';
import { getPaymentDateColumns, getDateLabel, LoanBookLiveRecord } from '@/types/loan-book-live-record';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicLoanBookTableProps {
  loanData: LoanBookLiveRecord[];
  isLoading: boolean;
  onExport: () => void;
  isExporting: boolean;
}

const DynamicLoanBookTable: React.FC<DynamicLoanBookTableProps> = ({
  loanData,
  isLoading,
  onExport,
  isExporting
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Get all available payment date columns dynamically from the actual data
  const paymentDateColumns = getPaymentDateColumns(loanData);
  
  // Initialize visibility state for all date columns
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const initialState: { [key: string]: boolean } = {};
    paymentDateColumns.forEach(col => {
      initialState[col] = true; // Show all columns by default
    });
    return initialState;
  });

  // Add new visible risk columns
  const [showRiskScore, setShowRiskScore] = useState(true);
  const [showRiskLevel, setShowRiskLevel] = useState(true);
  const [showDefaultProb, setShowDefaultProb] = useState(false);

  console.log('DynamicLoanBookTable received loan data:', loanData?.length, loanData?.[0]);

  // Apply smart calculations to the loan data
  const { smartLoanData, portfolioMetrics } = useSmartLoanCalculations(loanData || []);

  console.log('Smart loan data after calculations:', smartLoanData?.length, smartLoanData?.[0]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return smartLoanData.filter(loan => 
      loan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
    );
  }, [smartLoanData, searchTerm]);

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleRowExpansion = (loanId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(loanId)) {
      newExpanded.delete(loanId);
    } else {
      newExpanded.add(loanId);
    }
    setExpandedRows(newExpanded);
  };

  const getDataQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPaymentPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'accelerating': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'declining': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'regular': return <CheckCircle className="h-3 w-3 text-blue-600" />;
      default: return <AlertTriangle className="h-3 w-3 text-gray-600" />;
    }
  };

  // Show all visible columns - let users decide what to see
  const activePaymentColumns = useMemo(() => {
    return paymentDateColumns.filter(col => visibleColumns[col]);
  }, [visibleColumns, paymentDateColumns]);

  console.log('Active payment columns to display:', activePaymentColumns);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Loading Dynamic Loan Book...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="flex items-center text-lg">
            <TrendingUp className="mr-3 h-5 w-5" />
            Smart Dynamic Loan Book ({filteredData.length} records)
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
              Real-time • {paymentDateColumns.length} Payment Dates
            </Badge>
          </span>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Column Controls
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExport}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export All Columns'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Search and Column Controls */}
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Enhanced Column Visibility Controls */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600">Payment Dates:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allVisible = paymentDateColumns.every(col => visibleColumns[col]);
                  const newState: { [key: string]: boolean } = {};
                  paymentDateColumns.forEach(col => {
                    newState[col] = !allVisible;
                  });
                  setVisibleColumns(newState);
                }}
                className="h-7 text-xs"
              >
                {paymentDateColumns.every(col => visibleColumns[col]) ? 'Hide All' : 'Show All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Show only dates with payments
                  const newState: { [key: string]: boolean } = {};
                  paymentDateColumns.forEach(col => {
                    const hasPayments = smartLoanData.some(loan => {
                      const amount = (loan as any)[col];
                      return amount !== null && amount !== undefined && amount !== '<nil>' && 
                             amount !== 'null' && amount !== 'NULL' && amount !== '' && 
                             !isNaN(amount) && amount > 0;
                    });
                    newState[col] = hasPayments;
                  });
                  setVisibleColumns(newState);
                }}
                className="h-7 text-xs"
              >
                Show Only Active Dates
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {paymentDateColumns.map((column) => (
                <Button
                  key={column}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleColumnVisibility(column)}
                  className={`h-7 text-xs ${visibleColumns[column] ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {visibleColumns[column] ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
                  {getDateLabel(column)}
                </Button>
              ))}
            </div>
          </div>

          {/* Risk Column Toggles */}
          <div className="flex gap-2">
            <Button
              variant={showRiskScore ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRiskScore((s) => !s)}
            >
              Risk Score
            </Button>
            <Button
              variant={showRiskLevel ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRiskLevel((s) => !s)}
            >
              Risk Level
            </Button>
            <Button
              variant={showDefaultProb ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDefaultProb((s) => !s)}
            >
              Default Probability
            </Button>
          </div>
        </div>

        {/* Smart Portfolio Summary */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-semibold text-blue-900">{formatCurrency(portfolioMetrics.reliable_total_portfolio)}</p>
              <p className="text-blue-700">Total Portfolio</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-green-900">{formatCurrency(portfolioMetrics.reliable_total_paid)}</p>
              <p className="text-green-700">Total Collected</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-orange-900">{formatCurrency(portfolioMetrics.reliable_total_remaining)}</p>
              <p className="text-orange-700">Outstanding</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-purple-900">{portfolioMetrics.reliable_collection_rate.toFixed(1)}%</p>
              <p className="text-purple-700">Collection Rate</p>
            </div>
          </div>
        </div>

        {/* Enhanced Dynamic Table with Sticky Columns */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full"
            style={{
              /* Enable horizontal scrolling for date columns while keeping core columns visible */
              tableLayout: 'fixed'
            }}
          >
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 border-r border-border/50 sticky left-0 bg-white z-20"></TableHead>
                <TableHead className="border-r border-border/50 sticky left-8 bg-white z-20 min-w-32">Client Name</TableHead>
                <TableHead className="border-r-2 border-blue-200 bg-blue-50/30 sticky left-40 z-10 min-w-32">Amount Returnable</TableHead>
                {activePaymentColumns.map((column, index) => {
                  // Check if this date has any payments across all loans
                  const dateHasPayments = smartLoanData.some(loan => {
                    const amount = (loan as any)[column];
                    return amount !== null && amount !== undefined && amount !== '<nil>' && 
                           amount !== 'null' && amount !== 'NULL' && amount !== '' && 
                           !isNaN(amount) && amount > 0;
                  });
                  
                  return (
                    <TableHead 
                      key={column} 
                      className={`text-center transition-colors min-w-24 ${
                        dateHasPayments ? 'bg-green-50/40 hover:bg-green-100/60' : 'bg-gray-50/20 hover:bg-gray-100/40'
                      } ${
                        index === 0 ? 'border-l-2 border-green-300' : 'border-l border-green-200'
                      } ${
                        index === activePaymentColumns.length - 1 ? 'border-r-2 border-green-300' : 'border-r border-green-200'
                      }`}
                    >
                      <div className={`text-xs font-semibold ${dateHasPayments ? 'text-green-800' : 'text-gray-500'}`}>
                        {getDateLabel(column)}
                      </div>
                      <div className={`text-xs mt-1 ${dateHasPayments ? 'text-green-600' : 'text-gray-400'}`}>
                        {dateHasPayments ? '✓ Active' : '○ Empty'}
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="border-l-2 border-purple-200 bg-purple-50/30">Smart Balance</TableHead>
                <TableHead className="border-l border-border/50 bg-purple-50/30">Progress</TableHead>
                <TableHead className="border-l border-border/50 bg-purple-50/30">Pattern</TableHead>
                <TableHead className="border-l border-border/50 bg-purple-50/30">Quality</TableHead>
                <TableHead className="border-l border-border/50 border-r-2 border-purple-200 bg-purple-50/30">Status</TableHead>
                {showRiskScore && <TableHead className="border-l-2 border-orange-200 bg-orange-50/30">Risk Score</TableHead>}
                {showRiskLevel && <TableHead className="border-l border-border/50 bg-orange-50/30">Risk Level</TableHead>}
                {showDefaultProb && <TableHead className="border-l border-border/50 bg-orange-50/30">Prob. Default</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((loan) => {
                    console.log('Rendering loan row for:', loan.client_name, loan);
                    return (
                    <React.Fragment key={loan.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-gray-50 transition-colors ${
                          loan.recentlyUpdated ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                         >
                          <TableCell className="border-r border-border/50 sticky left-0 bg-white z-20">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(loan.id)}
                              className="h-6 w-6 p-0"
                            >
                              {expandedRows.has(loan.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium border-r border-border/50 sticky left-8 bg-white z-20">
                            <div className="flex flex-col">
                              <span className="font-medium">{loan.client_name}</span>
                              {loan.recentlyUpdated && (
                                <Badge variant="outline" className="mt-1 text-xs bg-blue-100 text-blue-800 w-fit">
                                  Updated
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500 mt-1">
                                {loan.paymentCompleteness.toFixed(0)}% complete
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-blue-600 font-semibold border-r-2 border-blue-200 bg-blue-50/10 sticky left-40 z-10">
                            {formatCurrency(loan.amount_returnable)}
                          </TableCell>
                          {activePaymentColumns.map((column, index) => {
                            const paymentAmount = (loan as any)[column];
                            // Enhanced null handling for all possible representations
                            const processPaymentValue = (value: any): number => {
                              if (value === null || value === undefined || value === '<nil>' || 
                                  value === 'null' || value === 'NULL' || value === '' || isNaN(value)) {
                                return 0;
                              }
                              return typeof value === 'number' ? value : parseFloat(value) || 0;
                            };
                            
                            const processedAmount = processPaymentValue(paymentAmount);
                            const hasPayment = processedAmount > 0;
                            
                            console.log(`Payment display for ${loan.client_name} on ${column}:`, 
                              `raw: ${paymentAmount}, processed: ${processedAmount}, hasPayment: ${hasPayment}`);
                            
                            return (
                              <TableCell 
                                key={column} 
                                className={`text-center transition-colors ${
                                  hasPayment ? 'bg-green-50/40 hover:bg-green-100/60' : 'bg-gray-50/20 hover:bg-gray-100/40'
                                } ${
                                  index === 0 ? 'border-l-2 border-green-300' : 'border-l border-green-200'
                                } ${
                                  index === activePaymentColumns.length - 1 ? 'border-r-2 border-green-300' : 'border-r border-green-200'
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <span className={`text-sm ${hasPayment ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                                    {hasPayment ? formatCurrency(processedAmount) : '—'}
                                  </span>
                                  {!hasPayment && processedAmount === 0 && (
                                    <span className="text-xs text-gray-300">No payment</span>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                         <TableCell className="font-semibold border-l-2 border-purple-200 bg-purple-50/10">
                           <div className="flex items-center gap-2">
                             <span className="text-red-600">{formatCurrency(loan.calculated_remaining_balance)}</span>
                             {loan.has_calculation_errors && (
                               <AlertTriangle className="h-4 w-4 text-yellow-600" />
                             )}
                           </div>
                         </TableCell>
                         <TableCell className="border-l border-border/50 bg-purple-50/10">
                           <div className="flex items-center gap-2">
                             <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                 style={{ width: `${Math.min(loan.calculated_progress, 100)}%` }}
                               />
                             </div>
                             <span className="text-xs font-medium">{loan.calculated_progress.toFixed(1)}%</span>
                           </div>
                         </TableCell>
                         <TableCell className="border-l border-border/50 bg-purple-50/10">
                           <div className="flex items-center gap-1">
                             {getPaymentPatternIcon(loan.payment_pattern)}
                             <span className="text-xs capitalize">{loan.payment_pattern}</span>
                           </div>
                         </TableCell>
                         <TableCell className="border-l border-border/50 bg-purple-50/10">
                           <Badge 
                             variant="outline" 
                             className={`${getDataQualityColor(loan.data_quality_score)}`}
                           >
                             {loan.data_quality_score.toFixed(0)}%
                           </Badge>
                         </TableCell>
                         <TableCell className="border-l border-border/50 border-r-2 border-purple-200 bg-purple-50/10">
                           <Badge 
                             variant={loan.status === 'active' ? 'default' : 'secondary'}
                             className={loan.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                           >
                             {loan.status}
                           </Badge>
                         </TableCell>
                         {showRiskScore && (
                           <TableCell className="border-l-2 border-orange-200 bg-orange-50/10">
                             <Badge
                               variant="outline"
                               className={
                                 loan.risk_level === "low"
                                   ? "bg-green-50 text-green-700"
                                   : loan.risk_level === "medium"
                                   ? "bg-yellow-50 text-yellow-700"
                                   : loan.risk_level === "high"
                                   ? "bg-orange-50 text-orange-700"
                                   : "bg-red-100 text-red-800"
                               }
                             >
                               {loan.risk_score}
                             </Badge>
                           </TableCell>
                         )}
                         {showRiskLevel && (
                           <TableCell className="capitalize border-l border-border/50 bg-orange-50/10">
                             <Badge
                               variant="outline"
                               className={
                                 loan.risk_level === "low"
                                   ? "bg-green-50 text-green-700"
                                   : loan.risk_level === "medium"
                                   ? "bg-yellow-50 text-yellow-700"
                                   : loan.risk_level === "high"
                                   ? "bg-orange-50 text-orange-700"
                                   : "bg-red-100 text-red-800"
                               }
                             >
                               {loan.risk_level}
                             </Badge>
                           </TableCell>
                         )}
                         {showDefaultProb && (
                           <TableCell className="border-l border-border/50 bg-orange-50/10">
                             {(loan.default_probability * 100).toFixed(0)}%
                           </TableCell>
                         )}
                      </motion.tr>

                      {/* Expanded Row Details */}
                      {expandedRows.has(loan.id) && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50"
                        >
                          <TableCell colSpan={activePaymentColumns.length + 8 + (showRiskScore ? 1 : 0) + (showRiskLevel ? 1 : 0) + (showDefaultProb ? 1 : 0)}>
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-700">Collection Efficiency</p>
                                  <p className="text-lg font-semibold text-purple-600">
                                    {loan.collection_efficiency.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Active Payments</p>
                                  <p className="text-lg font-semibold text-blue-600">
                                    {loan.activePayments.length} of {paymentDateColumns.length}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Estimated Completion</p>
                                  <p className="text-lg font-semibold text-green-600">
                                    {loan.estimated_completion_date || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Confidence Level</p>
                                  <Badge variant="outline" className={
                                    loan.confidence_level === 'high' ? 'text-green-700 bg-green-50' :
                                    loan.confidence_level === 'medium' ? 'text-yellow-700 bg-yellow-50' :
                                    loan.confidence_level === 'critical' ? 'text-red-700 bg-red-50' :
                                    'text-orange-700 bg-orange-50'
                                  }>
                                    {loan.confidence_level}
                                  </Badge>
                                </div>
                              </div>

                              {/* Show actual payment dates and amounts - only for this specific client */}
                              {loan.activePayments.length > 0 && (
                                <div className="mt-4">
                                  <p className="font-medium text-gray-700 mb-2">
                                    Payment History for {loan.client_name} ({loan.activePayments.length} payments):
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {loan.activePayments.map((payment, index) => (
                                      <div key={`${payment.date}-${index}`} className="text-center p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="text-xs text-green-700 font-medium">{payment.label}</p>
                                        <p className="text-sm font-semibold text-green-800">{formatCurrency(payment.amount)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Show message if no payments */}
                              {loan.activePayments.length === 0 && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="text-yellow-800 text-sm">
                                    No payments recorded for {loan.client_name}
                                  </p>
                                </div>
                              )}
                              
                              {/* Show data discrepancies */}
                              {loan.discrepancies.length > 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="font-medium text-yellow-800 mb-2">Data Discrepancies:</p>
                                  <ul className="text-sm text-yellow-700 space-y-1">
                                    {loan.discrepancies.map((discrepancy, index) => (
                                      <li key={index}>• {discrepancy}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={activePaymentColumns.length + 8 + (showRiskScore ? 1 : 0) + (showRiskLevel ? 1 : 0) + (showDefaultProb ? 1 : 0)} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">
                          {loanData && loanData.length === 0 ? 'No loan records available' : 'No records match your search'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicLoanBookTable;
