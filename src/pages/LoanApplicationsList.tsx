
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Eye, Loader2, AlertTriangle, Search, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLoanApplicationsQuery } from '@/hooks/use-loan-applications-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LoanApplicationsList = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { 
    data: applications = [], 
    isLoading, 
    error, 
    refetch
  } = useLoanApplicationsQuery();

  const filteredApplications = applications.filter(application => {
    const matchesSearch = !searchTerm || 
      application.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'disbursed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        if (status.startsWith('pending_')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: string | number): string => {
    if (!amount) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
    return isNaN(numAmount) ? 'N/A' : `UGX ${numAmount.toLocaleString()}`;
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Loan applications list has been updated"
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading applications...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Applications</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Loan Applications</h1>
            <p className="text-gray-600 mt-1">
              Manage and review loan applications ({applications.length} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/loan-applications/new">
                <FilePlus className="mr-2 h-4 w-4" />
                New Application
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Applications</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by client name, ID, or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending_manager">Pending Manager</SelectItem>
                    <SelectItem value="pending_director">Pending Director</SelectItem>
                    <SelectItem value="pending_ceo">Pending CEO</SelectItem>
                    <SelectItem value="pending_chairperson">Pending Chairperson</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FilePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search filters' 
                    : 'Start by creating a new loan application'}
                </p>
                <Button asChild>
                  <Link to="/loan-applications/new">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create New Application
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.client_name}</h3>
                        <Badge className={getStatusBadgeColor(application.status)}>
                          {application.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Loan Amount:</span> {formatCurrency(application.loan_amount)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {application.loan_type}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">ID Number:</span> {application.id_number || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {application.phone_number || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Employment:</span> {application.employment_status}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline">
                        <Link to={`/loan-applications/${application.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanApplicationsList;
