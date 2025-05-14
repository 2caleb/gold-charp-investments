
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Client {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  id_number: string;
  employment_status: string;
  monthly_income: number;
  created_at: string;
}

const ClientsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
  };

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const filteredClients = clients?.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone_number.includes(searchTerm) ||
    client.id_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 dark:text-white">Clients</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Manage your client records in one place
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/clients/new">
                <Button className="bg-purple-700 hover:bg-purple-800">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search by name, phone, or ID number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
                <span className="ml-2 text-lg">Loading clients...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">
                <p>Error loading clients. Please try again later.</p>
              </div>
            ) : (
              <>
                {filteredClients && filteredClients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Employment</TableHead>
                          <TableHead>Monthly Income</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.full_name}</TableCell>
                            <TableCell>{client.phone_number}</TableCell>
                            <TableCell>{client.id_number}</TableCell>
                            <TableCell>
                              <span className="capitalize">{client.employment_status}</span>
                            </TableCell>
                            <TableCell>UGX {formatCurrency(client.monthly_income)}</TableCell>
                            <TableCell>
                              <Link to={`/clients/${client.id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No clients found</p>
                    <Link to="/clients/new">
                      <Button className="bg-purple-700 hover:bg-purple-800">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Your First Client
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientsList;
