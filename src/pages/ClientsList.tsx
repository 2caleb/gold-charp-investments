
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, UserRound, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Client } from '@/types/schema';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_name')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Failed to load clients',
        description: error.message || 'Could not load client data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.id_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getEmploymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'employed': return 'bg-green-100 text-green-800';
      case 'self-employed': return 'bg-blue-100 text-blue-800';
      case 'unemployed': return 'bg-red-100 text-red-800';
      case 'student': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-serif font-bold dark:text-white">Client Database</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all your registered clients
            </p>
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="pl-9 w-full md:w-[250px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <Button asChild className="bg-purple-700 hover:bg-purple-800">
              <Link to="/clients/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Clients ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
                <span className="ml-3 text-lg">Loading clients...</span>
              </div>
            ) : paginatedClients.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>ID Number</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium flex items-center">
                            <UserRound className="h-5 w-5 mr-2 text-gray-500" />
                            {client.full_name}
                          </TableCell>
                          <TableCell>{client.id_number}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{client.phone_number}</span>
                              {client.email && (
                                <span className="text-xs text-gray-500">{client.email}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getEmploymentStatusColor(client.employment_status)}
                            >
                              {client.employment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(client.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/loan-applications/new?client=${client.id}`}>
                                Create Loan
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button 
                          key={page}
                          variant={currentPage === page ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <UserRound className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No clients found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'No clients match your search query' : 'You have not added any clients yet'}
                </p>
                <Button asChild className="bg-purple-700 hover:bg-purple-800">
                  <Link to="/clients/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Your First Client
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientsList;
