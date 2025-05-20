
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FilePlus, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { DataCollectionButton } from '@/components/loans/DataCollectionButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useDesktopRedirect } from '@/hooks/use-desktop-redirect';

interface LoanApplication {
  id: string;
  created_at: string;
  client_name: string;
  loan_type: string;
  loan_amount: string;
  status: string;
  loan_id: string;
}

const LoanApplicationsList = () => {
  useDesktopRedirect();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const permissions = useRolePermissions();
  const [searchTerm, setSearchTerm] = useState('');

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

      setLoans(data as LoanApplication[]);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast({
        title: "Error fetching loans",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const filteredLoans = loans.filter(loan => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return searchRegex.test(loan.client_name);
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Loan Applications</h1>
          <div className="flex space-x-2">
            <DataCollectionButton onDataCollected={() => {
              fetchLoans();
              toast({
                title: "Application created",
                description: "A new loan application has been created via client data collection"
              });
            }} />
          </div>
        </div>

        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by client name"
            className="border rounded px-4 py-2 w-1/3"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading applications...
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
                  <th className="py-2 px-4 text-left">Loan ID</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Client</th>
                  <th className="py-2 px-4 text-left">Loan Type</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(loan => (
                  <tr key={loan.id} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4">{loan.loan_id}</td>
                    <td className="py-2 px-4">{new Date(loan.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{loan.client_name}</td>
                    <td className="py-2 px-4">{loan.loan_type}</td>
                    <td className="py-2 px-4">UGX {loan.loan_amount}</td>
                    <td className="py-2 px-4">{loan.status}</td>
                    <td className="py-2 px-4">
                      <Link to={`/loan-applications/${loan.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanApplicationsList;
