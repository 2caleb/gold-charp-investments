import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FilePlus, Eye, Loader2, AlertTriangle, InfoIcon, UserRound, Phone, Medal } from 'lucide-react';
import { DataCollectionButton } from '@/components/loans/DataCollectionButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LoanApplication {
  id: string;
  created_at: string;
  client_name: string;
  loan_type: string;
  loan_amount: string;
  status: string;
  loan_id: string;
  id_number?: string;
  phone_number?: string;
  employment_status?: string;
  monthly_income?: number;
  purpose_of_loan?: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface ClientData {
  id: string;
  full_name: string;
  id_number: string;
  phone_number: string;
  email?: string;
  employment_status: string;
  monthly_income: number;
  created_at: string;
}

const LoanApplicationsList = () => {
  useDesktopRedirect();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [clients, setClients] = useState<Record<string, ClientData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const permissions = useRolePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const fetchClientsData = async () => {
    try {
      const { data, error } = await supabase
        .from('client_name')
        .select('*');

      if (error) {
        throw error;
      }

      // Create a mapping of client data for easy access
      const clientsMap: Record<string, ClientData> = {};
      data?.forEach(client => {
        clientsMap[client.id] = client as ClientData;
        // Also map by name for easier lookup
        clientsMap[client.full_name] = client as ClientData;
      });

      setClients(clientsMap);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Enrich loan data with client details
      const enrichedLoans = data?.map((loan: any) => {
        return {
          ...loan,
          // Ensure we have all required fields, even if they're not in the DB
          id_number: loan.id_number || '',
          phone_number: loan.phone_number || '',
          employment_status: loan.employment_status || '',
          monthly_income: loan.monthly_income || 0,
          purpose_of_loan: loan.purpose_of_loan || loan.purpose || ''
        };
      }) as LoanApplication[];

      setLoans(enrichedLoans);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast({
        title: "Error fetching loans",
        description: err.message || 'Could not load loan applications',
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // First fetch clients, then fetch loans
    fetchClientsData().then(() => fetchLoans());
  }, []);

  const filteredLoans = loans.filter(loan => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const statusMatch = statusFilter ? loan.status === statusFilter : true;

    return (searchRegex.test(loan.client_name) || 
            searchRegex.test(loan.id_number || '') || 
            searchRegex.test(loan.phone_number || '')) && statusMatch;
  });

  // Helper function to find client data for a loan
  const findClientData = (loan: LoanApplication): ClientData | null => {
    // Try to find client by ID first, then by name
    return clients[loan.client_name] || null;
  };

  // Enrich loan with client data
  const enrichLoan = (loan: LoanApplication): LoanApplication => {
    const clientData = findClientData(loan);
    if (!clientData) return loan;

    return {
      ...loan,
      id_number: loan.id_number || clientData.id_number || '',
      phone_number: loan.phone_number || clientData.phone_number || '',
      employment_status: loan.employment_status || clientData.employment_status || '',
      monthly_income: loan.monthly_income || clientData.monthly_income || 0
    };
  };

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
              View and manage all loan applications
            </p>
          </div>
          <div className="flex space-x-2">
            <DataCollectionButton onDataCollected={() => {
              fetchLoans();
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

        <div className="mb-4 flex flex-wrap md:flex-nowrap items-center gap-4">
          <input
            type="text"
            placeholder="Search by client name, ID, or phone"
            className="border rounded px-4 py-2 w-full md:w-1/3"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded px-4 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="ml-auto flex gap-2">
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading applications...</span>
          </div>
        ) : error ? (
          <div className="text-red-500">
            <AlertTriangle className="mr-2 inline-block" />
            Error: {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-md">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Loan ID</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Client</th>
                  {viewMode === 'detailed' && (
                    <>
                      <th className="py-3 px-4 text-left">Contact</th>
                      <th className="py-3 px-4 text-left">Employment</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-left">Loan Type</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  {viewMode === 'detailed' && (
                    <th className="py-3 px-4 text-left">Purpose</th>
                  )}
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(loan => {
                  const enrichedLoan = enrichLoan(loan);
                  return (
                    <tr key={loan.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 font-mono text-sm">{loan.loan_id}</td>
                      <td className="py-3 px-4">{new Date(loan.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <UserRound className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{enrichedLoan.client_name}</span>
                        </div>
                        {enrichedLoan.id_number && viewMode === 'compact' && (
                          <span className="text-xs text-gray-500 block">ID: {enrichedLoan.id_number}</span>
                        )}
                      </td>
                      
                      {viewMode === 'detailed' && (
                        <>
                          <td className="py-3 px-4">
                            {enrichedLoan.phone_number && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-500 mr-1" />
                                <span>{enrichedLoan.phone_number}</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500 block">ID: {enrichedLoan.id_number || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={
                              enrichedLoan.employment_status === 'Employed' ? 'bg-green-100 text-green-800' : 
                              enrichedLoan.employment_status === 'Self-Employed' ? 'bg-blue-100 text-blue-800' :
                              enrichedLoan.employment_status === 'Unemployed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {enrichedLoan.employment_status || 'Unknown'}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              Income: {formatCurrency(enrichedLoan.monthly_income || 0)}
                            </div>
                          </td>
                        </>
                      )}
                      
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          {enrichedLoan.loan_type}
                        </Badge>
                      </td>
                      
                      <td className="py-3 px-4 font-medium">{formatCurrency(enrichedLoan.loan_amount)}</td>
                      
                      {viewMode === 'detailed' && (
                        <td className="py-3 px-4 max-w-xs truncate" title={enrichedLoan.purpose_of_loan || ''}>
                          {enrichedLoan.purpose_of_loan || 'N/A'}
                        </td>
                      )}
                      
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadgeColor(enrichedLoan.status)}>
                          {enrichedLoan.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      
                      <td className="py-3 px-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={`/loan-applications/${loan.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View complete application details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredLoans.length === 0 && (
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
