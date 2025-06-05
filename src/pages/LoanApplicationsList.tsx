
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FilePlus, Eye, Loader2, AlertTriangle, InfoIcon, UserRound, Phone, Filter, RefreshCw } from 'lucide-react';
import { DataCollectionButton } from '@/components/loans/DataCollectionButton';
import { useToast } from '@/hooks/use-toast';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FilterOption {
  label: string;
  value: string;
}

const LoanApplicationsList = () => {
  useDesktopRedirect();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  
  const { 
    applications, 
    isLoading, 
    error, 
    refreshData,
    getWorkflowStatus 
  } = useDashboardData();

  const filteredApplications = applications.filter(application => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const statusMatch = statusFilter ? application.status === statusFilter : true;

    return (searchRegex.test(application.client_name) || 
            searchRegex.test(application.id_number || '') || 
            searchRegex.test(application.phone_number || '')) && 
            statusMatch;
  });

  const statusOptions: FilterOption[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Pending Manager', value: 'pending_manager' },
    { label: 'Pending Director', value: 'pending_director' },
    { label: 'Pending CEO', value: 'pending_ceo' },
    { label: 'Pending Chairperson', value: 'pending_chairperson' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Disbursed', value: 'disbursed' },
    { label: 'Completed', value: 'completed' },
  ];

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'disbursed': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default:
        if (status.startsWith('pending_')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: string | number): string => {
    if (!amount) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
    return isNaN(numAmount) ? 'N/A' : `UGX ${numAmount.toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Loan Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all loan applications ({applications.length} total)
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <DataCollectionButton onDataCollected={() => {
              refreshData();
              toast({
                title: "Application created",
                description: "A new loan application has been created via client data collection"
              });
            }} />
            <Button asChild>
              <Link to="/loan-applications/new">
                <FilePlus className="mr-2 h-4 w-4" />
                New Application
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by client name, ID, or phone"
                className="border rounded px-4 py-2 w-full pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <div className="relative">
              <select
                id="status"
                className="border rounded px-4 py-2 w-full appearance-none pl-10"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
          
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'compact' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('compact')}
            >
              Compact
            </Button>
            <Button 
              variant={viewMode === 'detailed' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading applications...</span>
          </div>
        ) : error ? (
          <div className="text-red-500">
            <AlertTriangle className="mr-2 inline-block" />
            Error: {error.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-md">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Client</th>
                  {viewMode === 'detailed' && (
                    <th className="py-3 px-4 text-left">Contact</th>
                  )}
                  <th className="py-3 px-4 text-left">Loan Type</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Workflow</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(application => (
                  <tr key={application.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">{new Date(application.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <UserRound className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{application.client_name}</span>
                      </div>
                      {application.id_number && viewMode === 'compact' && (
                        <span className="text-xs text-gray-500 block">ID: {application.id_number}</span>
                      )}
                    </td>
                    
                    {viewMode === 'detailed' && (
                      <td className="py-3 px-4">
                        {application.phone_number && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{application.phone_number}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 block">ID: {application.id_number || 'N/A'}</span>
                      </td>
                    )}
                    
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        {application.loan_type}
                      </Badge>
                    </td>
                    
                    <td className="py-3 px-4 font-medium">{formatCurrency(application.loan_amount)}</td>
                    
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(application.status)}>
                        {application.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">
                        {getWorkflowStatus(application)}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`/loan-applications/${application.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Review application and take workflow actions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!isLoading && filteredApplications.length === 0 && (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <InfoIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No loan applications found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your search filters' 
                : 'Start by creating a new loan application'}
            </p>
            <Button asChild>
              <Link to="/loan-applications/new">
                <FilePlus className="mr-2 h-4 w-4" />
                Create New Application
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanApplicationsList;
