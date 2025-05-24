
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolePermissions } from '@/hooks/use-role-permissions';

interface WeeklyReport {
  id: string;
  report_week: string;
  role_type: string;
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  total_loan_amount: number;
  approved_loan_amount: number;
  report_data: any;
  generated_at: string;
}

const WeeklyReportsViewer: React.FC = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { userRole } = useRolePermissions();

  useEffect(() => {
    fetchReports();
  }, [userRole]);

  const fetchReports = async () => {
    if (!userRole) return;

    try {
      setIsLoading(true);
      
      // Use the edge function to get weekly reports
      const { data, error } = await supabase.functions.invoke('get-weekly-reports', {
        body: { target_role: userRole }
      });

      if (error) {
        console.warn('Weekly reports function error:', error);
        setReports([]);
        return;
      }
      
      // Ensure data is an array and cast to WeeklyReport[]
      const reportsData = Array.isArray(data) ? data as WeeklyReport[] : [];
      setReports(reportsData);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch weekly reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('enhanced-workflow-system', {
        body: { action: 'generate_weekly_report' }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Weekly reports generated successfully',
      });

      fetchReports();
    } catch (error: any) {
      console.error('Error generating reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate weekly reports',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const getWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const getApprovalRate = (report: WeeklyReport) => {
    if (report.total_applications === 0) return 0;
    return Math.round((report.approved_applications / report.total_applications) * 100);
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
          <h2 className="text-2xl font-bold">Weekly Reports</h2>
          <p className="text-gray-600">Performance insights for {userRole?.replace('_', ' ')}</p>
        </div>
        <Button onClick={generateWeeklyReport} disabled={isGenerating}>
          <FileText className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Reports Available</h3>
            <p className="text-gray-500">Weekly reports will be generated automatically every Friday.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Latest Report Summary */}
          {reports[0] && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold">{reports[0].total_applications}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{reports[0].approved_applications}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{reports[0].rejected_applications}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approval Rate</p>
                      <p className="text-2xl font-bold">{getApprovalRate(reports[0])}%</p>
                    </div>
                    <Badge variant="outline">{userRole}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reports.slice(0, 8).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="report_week" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => getWeekRange(value)}
                    formatter={(value, name) => [value, name === 'approved_applications' ? 'Approved' : 'Total']}
                  />
                  <Bar dataKey="total_applications" fill="#8884d8" name="total_applications" />
                  <Bar dataKey="approved_applications" fill="#82ca9d" name="approved_applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Week of {getWeekRange(report.report_week)}</h4>
                        <p className="text-sm text-gray-500">
                          Generated on {new Date(report.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total: </span>
                        <span className="font-medium">{report.total_applications}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Approved: </span>
                        <span className="font-medium text-green-600">{report.approved_applications}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rejected: </span>
                        <span className="font-medium text-red-600">{report.rejected_applications}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount: </span>
                        <span className="font-medium">{formatCurrency(report.approved_loan_amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportsViewer;
