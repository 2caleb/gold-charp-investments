
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoanPerformanceChart } from '@/components/dashboard/LoanPerformanceChart';
import { RiskProfileMap } from '@/components/dashboard/RiskProfileMap';
import { PropertyInsights } from '@/components/dashboard/PropertyInsights';
import { FieldOfficerActivity } from '@/components/dashboard/FieldOfficerActivity';
import SmartDashboardMonitor from '@/components/dashboard/SmartDashboardMonitor';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDashboardData, DashboardData } from '@/services/dashboardService';
import { ArrowRight, ClipboardCheck, BarChart2, FileCheck, AlertTriangle, Stamp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { userProfile } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    userRole, 
    isFieldOfficer, 
    isManager, 
    isDirector, 
    isCEO, 
    isChairperson 
  } = useRolePermissions();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchDashboardData(user.id);
        setDashboardData(data);
        console.log('Dashboard data loaded successfully');
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error loading dashboard",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, toast]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Welcome back, {userProfile?.full_name || 'User'}</h1>
            <p className="text-gray-600">
              Here's an overview of loan applications and their status.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-4">
            <Button asChild variant="outline">
              <Link to="/loan-applications">
                View Applications
              </Link>
            </Button>
            <Button asChild className="bg-purple-700 hover:bg-purple-800">
              <Link to="/loan-applications/new">
                New Application
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Statistics */}
        {dashboardData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalApplications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingApplications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData.approvedApplications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX {dashboardData.totalLoanAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Smart Monitor */}
        <div className="mb-6">
          <SmartDashboardMonitor />
        </div>

        {/* Role-specific action cards */}
        {userRole && (
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Your Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isManager && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Manager Review Dashboard</CardTitle>
                    <CardDescription>Review loan applications that need manager approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="default" 
                      className="bg-indigo-600 hover:bg-indigo-700 w-full"
                      asChild
                    >
                      <Link to="/staff/manager-review" className="flex items-center justify-between">
                        <span className="flex items-center">
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Review Applications
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {isDirector && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Risk Assessment Dashboard</CardTitle>
                    <CardDescription>Assess risk for approved loan applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="default" 
                      className="bg-amber-600 hover:bg-amber-700 w-full"
                      asChild
                    >
                      <Link to="/staff/director-risk" className="flex items-center justify-between">
                        <span className="flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Assess Risk
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {isCEO && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">CEO Approval Dashboard</CardTitle>
                    <CardDescription>Review and approve risk-assessed applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="default" 
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                      asChild
                    >
                      <Link to="/staff/ceo-approval" className="flex items-center justify-between">
                        <span className="flex items-center">
                          <FileCheck className="mr-2 h-4 w-4" />
                          Review for Approval
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {isChairperson && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Chairperson Final Approval</CardTitle>
                    <CardDescription>Finalize approvals for CEO-approved applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700 w-full"
                      asChild
                    >
                      <Link to="/staff/chairperson-approval" className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Stamp className="mr-2 h-4 w-4" />
                          Final Approvals
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {isFieldOfficer && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Data Collection</CardTitle>
                    <CardDescription>Collect and manage client data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="default" 
                      className="bg-purple-600 hover:bg-purple-700 w-full"
                      asChild
                    >
                      <Link to="/staff/data-collection" className="flex items-center justify-between">
                        <span className="flex items-center">
                          <BarChart2 className="mr-2 h-4 w-4" />
                          Collect Data
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LoanPerformanceChart />
          <RiskProfileMap />
        </div>

        {/* Property Insights - Now full width for better visibility */}
        <div className="mb-6">
          <PropertyInsights />
        </div>
        
        {/* Field Officer Activity */}
        <div>
          <FieldOfficerActivity />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
