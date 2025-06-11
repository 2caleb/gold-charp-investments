
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Download, FileText, TrendingUp, FileDown } from 'lucide-react';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { exportWeeklyReportToPDF, exportMultipleReportsToPDF } from '@/utils/pdfExportUtils';
import { useQuery } from '@tanstack/react-query';

interface WeeklyReport {
  id: string;
  role_type: string;
  report_week: string;
  applications_reviewed: number;
  applications_approved: number;
  applications_rejected: number;
  pending_applications: number;
  created_at: string;
}

interface FinancialData {
  total_income?: number;
  total_expenses?: number;
  net_income?: number;
  total_loan_portfolio?: number;
  total_repaid?: number;
  outstanding_balance?: number;
  active_loan_holders?: number;
  collection_rate?: number;
}

interface TransactionData {
  id: string;
  amount: number;
  description: string;
  category: string;
  transaction_type: string;
  date: string;
  status: string;
}

const WeeklyReportsViewer: React.FC = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingReportId, setExportingReportId] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const { userRole } = useRolePermissions();
  const { toast } = useToast();

  // Fetch comprehensive financial data for PDF export
  const { data: financialData } = useQuery({
    queryKey: ['comprehensive-financial-data'],
    queryFn: async () => {
      console.log('Fetching comprehensive financial data for PDF export...');
      
      const { data, error } = await supabase
        .from('financial_summary')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching financial data:', error);
        return null;
      }
      return data;
    },
  });

  // Fetch recent transaction data for PDF export
  const { data: transactionData } = useQuery({
    queryKey: ['recent-transactions-for-pdf'],
    queryFn: async () => {
      console.log('Fetching recent transactions for PDF export...');
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching transaction data:', error);
        return [];
      }
      return data || [];
    },
  });

  useEffect(() => {
    if (userRole && ['manager', 'director', 'chairperson', 'ceo'].includes(userRole)) {
      fetchReports();
    }
  }, [userRole]);

  const fetchReports = async () => {
    if (!userRole) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-workflow-system', {
        body: {
          action: 'get_weekly_reports',
          target_role: userRole
        }
      });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch weekly reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-workflow-system', {
        body: {
          action: 'generate_weekly_report'
        }
      });

      if (error) throw error;

      toast({
        title: 'Reports Generated',
        description: 'Weekly reports have been generated successfully',
      });

      fetchReports(); // Refresh the reports
    } catch (error: any) {
      console.error('Error generating reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate weekly reports',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (report: WeeklyReport) => {
    setExportingReportId(report.id);
    try {
      console.log('Exporting comprehensive report with financial data...');
      await exportWeeklyReportToPDF(report, financialData, transactionData);
      toast({
        title: 'Export Successful',
        description: `Comprehensive report for ${report.role_type} exported successfully`,
      });
    } catch (error: any) {
      console.error('Error exporting comprehensive report:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export comprehensive report to PDF',
        variant: 'destructive',
      });
    } finally {
      setExportingReportId(null);
    }
  };

  const handleExportAllReports = async () => {
    if (reports.length === 0) {
      toast({
        title: 'No Reports',
        description: 'No reports available to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExportingAll(true);
    try {
      console.log('Exporting consolidated comprehensive report...');
      await exportMultipleReportsToPDF(reports, financialData, transactionData);
      toast({
        title: 'Export Successful',
        description: 'All comprehensive reports exported successfully',
      });
    } catch (error: any) {
      console.error('Error exporting all comprehensive reports:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export consolidated comprehensive report',
        variant: 'destructive',
      });
    } finally {
      setIsExportingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive Financial Reports</h1>
          <p className="text-gray-600">Generate and export detailed financial and workflow reports</p>
        </div>
        <div className="flex gap-3">
          {reports.length > 0 && (
            <Button 
              onClick={handleExportAllReports}
              disabled={isExportingAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              {isExportingAll ? 'Exporting All...' : 'Export All Comprehensive Reports'}
            </Button>
          )}
          <Button 
            onClick={generateWeeklyReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Reports Available</h3>
              <p className="text-gray-500 mb-4">
                No weekly reports have been generated yet for your role.
              </p>
              <Button onClick={generateWeeklyReport} disabled={isGenerating}>
                Generate First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Week of {formatDate(report.report_week)}
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {report.role_type.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.applications_reviewed}
                    </div>
                    <div className="text-sm text-gray-600">Reviewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {report.applications_approved}
                    </div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {report.applications_rejected}
                    </div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {report.pending_applications}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
                
                {financialData && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Financial Overview (Current Period):</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {new Intl.NumberFormat('en-UG', {
                            style: 'currency',
                            currency: 'UGX',
                            notation: 'compact',
                            maximumFractionDigits: 0
                          }).format(financialData.total_income || 0)}
                        </div>
                        <div className="text-gray-500">Income</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">
                          {new Intl.NumberFormat('en-UG', {
                            style: 'currency',
                            currency: 'UGX',
                            notation: 'compact',
                            maximumFractionDigits: 0
                          }).format(financialData.total_expenses || 0)}
                        </div>
                        <div className="text-gray-500">Expenses</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          {new Intl.NumberFormat('en-UG', {
                            style: 'currency',
                            currency: 'UGX',
                            notation: 'compact',
                            maximumFractionDigits: 0
                          }).format(financialData.total_loan_portfolio || 0)}
                        </div>
                        <div className="text-gray-500">Portfolio</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">
                          {(financialData.collection_rate || 0).toFixed(1)}%
                        </div>
                        <div className="text-gray-500">Collection</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Generated: {formatDate(report.created_at)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportReport(report)}
                      disabled={exportingReportId === report.id}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {exportingReportId === report.id ? 'Exporting...' : 'Export Comprehensive PDF'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WeeklyReportsViewer;
