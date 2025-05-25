import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { DataCollectionButton } from '@/components/loans/DataCollectionButton';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, FileText, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateLoanIdentificationNumber } from '@/utils/loanUtils';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { useAuth } from '@/contexts/AuthContext';

interface RecentApplication {
  client_name: string;
  loan_type: string;
  loan_amount: string;
  status: string;
  created_at: string;
  id: string;
  loan_id?: string;
}

interface ClientData {
  id: string;
  monthly_income: number;
}

const DataCollection = () => {
  useDesktopRedirect();
  
  const { toast } = useToast();
  const { user, session, isAuthenticated } = useAuth();
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingApplications: 0,
    monthlyLoans: 0,
    scheduledVisits: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user || !session) {
        console.log('User not authenticated, skipping data fetch');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching dashboard data for authenticated user:', user.id);
        
        // Fetch recent applications with proper authentication
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('loan_applications')
          .select('id, client_name, loan_amount, loan_type, status, created_at, loan_id')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (applicationsError) {
          console.error('Applications fetch error:', applicationsError);
          throw applicationsError;
        }
        
        console.log('Applications fetched:', applicationsData?.length || 0);
        
        if (applicationsData && Array.isArray(applicationsData)) {
          const safeData = applicationsData.map(app => ({
            id: app.id || '',
            client_name: app.client_name || '',
            loan_amount: app.loan_amount || '',
            loan_type: app.loan_type || '',
            status: app.status || '',
            created_at: app.created_at || '',
            loan_id: app.loan_id || 'No ID'
          }));
          
          setRecentApplications(safeData);
        }
        
        // Fetch stats for authenticated users
        const { count: clientCount, error: clientError } = await supabase
          .from('client_name')
          .select('id', { count: 'exact', head: true });
          
        if (clientError) {
          console.error('Client count error:', clientError);
        }
        
        // Fetch client income data to calculate monthly loans
        const { data: clientData, error: incomeError } = await supabase
          .from('client_name')
          .select('id, monthly_income');
          
        if (incomeError) {
          console.error('Client income error:', incomeError);
        }
        
        // Calculate total monthly income from all clients
        let totalMonthlyIncome = 0;
        if (clientData && Array.isArray(clientData)) {
          clientData.forEach((client: ClientData) => {
            totalMonthlyIncome += (client.monthly_income || 0);
          });
        }
        
        const { count: pendingCount, error: pendingError } = await supabase
          .from('loan_applications')
          .select('id', { count: 'exact', head: true })
          .in('status', ['submitted', 'pending_manager', 'pending_director', 'pending_ceo', 'pending_chairperson']);
          
        if (pendingError) {
          console.error('Pending count error:', pendingError);
        }
        
        setStats({
          totalClients: clientCount || 0,
          pendingApplications: pendingCount || 0,
          monthlyLoans: totalMonthlyIncome,
          scheduledVisits: 18 // Mock data
        });

        console.log('Dashboard data loaded successfully');
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Data Fetch Error',
          description: error.message || 'Failed to load data. Please ensure you are logged in.',
          variant: 'destructive'
        });
        setRecentApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast, user, session, isAuthenticated]);

  // Show login message if not authenticated
  if (!isAuthenticated || !user || !session) {
    return (
      <Layout>
        <section className="bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
              <p className="text-lg text-gray-600 mb-6">
                Please log in to access the client data collection dashboard.
              </p>
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const handleGenerateNewLoanId = () => {
    const newLoanId = generateLoanIdentificationNumber();
    
    toast({
      title: "New Loan ID Generated",
      description: `ID: ${newLoanId} - Ready to use for your next application.`,
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(newLoanId)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The loan ID has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-white">
                Client Data Collection
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Collect and manage client information for loan processing
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <DataCollectionButton onDataCollected={() => {
                toast({
                  title: "Data Collected",
                  description: "New client data has been successfully collected and saved."
                });
              }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-gray-500 mt-1">+5 new this week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Monthly Loans</CardTitle>
                <ChartBar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX {(stats.monthlyLoans / 1000000).toFixed(0)}M</div>
                <p className="text-xs text-gray-500 mt-1">Based on client income</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Scheduled Visits</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scheduledVisits}</div>
                <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest client applications submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">Loading applications...</p>
                    </div>
                  ) : recentApplications.length > 0 ? (
                    recentApplications.map((app, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{app.client_name}</p>
                          <p className="text-sm text-gray-500">
                            {app.loan_type} - UGX {app.loan_amount}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            ID: {app.loan_id || 'Not assigned'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">No applications found</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/loan-applications">
                    <Button variant="outline" size="sm" className="w-full">View All Applications</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for client management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/clients/new">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <Users className="min-w-4 h-4 mr-2" />
                      <span className="truncate">Add New Client</span>
                    </Button>
                  </Link>
                  <Link to="/loan-applications/new">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <FileText className="min-w-4 h-4 mr-2" />
                      <span className="truncate">New Loan Application</span>
                    </Button>
                  </Link>
                  <Link to="/clients">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <Users className="min-w-4 h-4 mr-2" />
                      <span className="truncate">View All Clients</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <ChartBar className="min-w-4 h-4 mr-2" />
                      <span className="truncate">View Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DataCollection;
