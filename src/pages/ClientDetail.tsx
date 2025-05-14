
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Loader2, FileCheck, PenLine, FilePlus } from 'lucide-react';
import { format } from 'date-fns';
import { Client } from '@/types/schema';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchClientDetail = async () => {
    if (!id) throw new Error("Client ID is required");
    
    // Use raw fetch instead of supabase client due to typing issues
    const response = await fetch(`https://bjsxekgraxbfqzhbqjff.supabase.co/rest/v1/clients?id=eq.${id}&select=*`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3hla2dyYXhiZnF6aGJxamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjMxNzUsImV4cCI6MjA2MjY5OTE3NX0.XdyZ0y4pGsaARlhHEYs3zj-shj0i3szpOkRZC_CQ18Y'
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch client");
    }
    
    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("Client not found");
    }
    
    return data[0] as Client;
  };

  const fetchClientLoans = async () => {
    if (!id) throw new Error("Client ID is required");
    
    const response = await fetch(`https://bjsxekgraxbfqzhbqjff.supabase.co/rest/v1/loans?client_id=eq.${id}&select=*`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3hla2dyYXhiZnF6aGJxamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjMxNzUsImV4cCI6MjA2MjY5OTE3NX0.XdyZ0y4pGsaARlhHEYs3zj-shj0i3szpOkRZC_CQ18Y'
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch loans");
    }
    
    return await response.json() || [];
  };

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: fetchClientDetail,
    enabled: !!id,
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['client-loans', id],
    queryFn: fetchClientLoans,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-700" />
            <p className="mt-4 text-gray-600">Loading client details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Client</h2>
            <p className="text-red-600">We couldn't load the client details. The client may not exist or there was a problem with the connection.</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 md:mb-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
            </Button>
            
            <div className="space-x-3">
              <Link to={`/clients/${id}/edit`}>
                <Button variant="outline">
                  <PenLine className="mr-2 h-4 w-4" /> Edit Details
                </Button>
              </Link>
              <Link to={`/loan-applications/new?client=${id}`}>
                <Button className="bg-purple-700 hover:bg-purple-800">
                  <FilePlus className="mr-2 h-4 w-4" /> New Loan Application
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Personal Details</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="font-medium">{client.full_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
                        <p className="font-medium">{client.id_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="font-medium">{client.phone_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{client.email || "Not provided"}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                        <p className="font-medium">{client.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Financial Information</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Employment Status</p>
                        <p className="font-medium capitalize">{client.employment_status}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
                        <p className="font-medium">UGX {formatCurrency(client.monthly_income)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Record Information</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client Since</p>
                        <p className="font-medium">{format(new Date(client.created_at), 'PPP')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Loan History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loans.length > 0 ? (
                    <ul className="space-y-3">
                      {loans.map((loan) => (
                        <li key={loan.id} className="border-b pb-2">
                          <Link to={`/loans/${loan.id}`} className="hover:text-purple-600 block">
                            <div className="flex justify-between">
                              <span className="font-medium">UGX {formatCurrency(loan.principal_amount)}</span>
                              <span className={`text-sm px-2 py-0.5 rounded-full ${
                                loan.status === 'active' ? 'bg-green-100 text-green-800' : 
                                loan.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Term: {loan.term_months} months | Interest: {loan.interest_rate}%
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <FileCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                      <p className="text-gray-500 mt-2">No loan history yet</p>
                      <Link to={`/loan-applications/new?client=${id}`}>
                        <Button variant="outline" size="sm" className="mt-3">
                          Apply for Loan
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientDetail;
