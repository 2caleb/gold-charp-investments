
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

const ManagerReviewDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole } = useRolePermissions();
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        setIsLoading(true);
        
        // Fetch applications that need manager review
        const { data, error } = await supabase
          .from('loan_applications')
          .select(`
            id, 
            client_name, 
            loan_amount, 
            loan_type, 
            purpose_of_loan,
            created_at, 
            status,
            loan_application_workflow(current_stage)
          `)
          .or('status.eq.pending_manager,status.eq.submitted')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setApplications(data || []);
        setFilteredApplications(data || []);
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Failed to load applications',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole === 'manager') {
      fetchPendingApplications();
    } else {
      setIsLoading(false);
    }
  }, [toast, userRole]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = applications.filter(app => 
        app.client_name.toLowerCase().includes(lowercasedQuery) ||
        app.loan_type.toLowerCase().includes(lowercasedQuery) ||
        app.purpose_of_loan.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredApplications(filtered);
    }
  }, [searchQuery, applications]);

  const handleViewApplication = (id: string) => {
    navigate(`/loan-applications/${id}`);
  };

  if (userRole !== 'manager') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <motion.h1 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Manager Review Dashboard
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <AlertCircle className="text-amber-500 h-12 w-12 mr-4" />
                <p className="text-lg text-gray-600">
                  You do not have permission to access this page. This page is only available for users with the manager role.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Manager Review Dashboard</h1>
            <p className="text-lg text-gray-600 mb-6">
              Review and approve loan applications that have passed initial field officer screening.
            </p>
          </div>
          
          <div className="relative w-full md:w-64 mt-4 md:mt-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <p>Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <CheckCircle className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">No applications pending review</p>
                <p className="text-gray-500">All current applications have been reviewed.</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-medium">
                        {application.client_name}
                      </CardTitle>
                      <Badge className={`${application.status === 'submitted' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                        <p className="text-lg">{Number(application.loan_amount).toLocaleString()} UGX</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Loan Type</p>
                        <p className="text-lg capitalize">{application.loan_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Purpose</p>
                        <p className="text-lg">{application.purpose_of_loan}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Stage</p>
                        <p className="text-lg">Manager Review</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center hover:bg-purple-50 hover:border-purple-200 transition-colors"
                          onClick={() => handleViewApplication(application.id)}
                        >
                          <Eye className="mr-2 h-4 w-4 text-purple-700" />
                          Review Application
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManagerReviewDashboard;
