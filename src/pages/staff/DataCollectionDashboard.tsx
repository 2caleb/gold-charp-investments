
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataCollectionButton from '@/components/loans/DataCollectionButton';
import { useToast } from '@/components/ui/use-toast';
import { Shield, ClipboardCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Types for client data and its statuses
type ClientDataStatus = 'pending' | 'manager_reviewing' | 'director_reviewing' | 'ceo_reviewing' | 'approved' | 'rejected';

interface ClientData {
  id: string;
  client_name: string;
  submission_date: string;
  status: ClientDataStatus;
  submitted_by: string;
  last_updated: string;
  notes: string;
  manager_feedback?: string;
  director_feedback?: string;
  ceo_feedback?: string;
}

// Mock data - in a real app this would come from the database
const mockClientData: ClientData[] = [
  {
    id: '1',
    client_name: 'John Smith',
    submission_date: '2023-05-10',
    status: 'pending',
    submitted_by: 'Field Officer 1',
    last_updated: '2023-05-10',
    notes: 'Client looking for mortgage options',
  },
  {
    id: '2',
    client_name: 'Jane Doe',
    submission_date: '2023-05-08',
    status: 'manager_reviewing',
    submitted_by: 'Field Officer 2',
    last_updated: '2023-05-09',
    notes: 'Interested in commercial property',
    manager_feedback: 'Checking credit history',
  },
  {
    id: '3',
    client_name: 'Robert Johnson',
    submission_date: '2023-05-05',
    status: 'director_reviewing',
    submitted_by: 'Field Officer 1',
    last_updated: '2023-05-07',
    notes: 'High net worth individual',
    manager_feedback: 'All documents verified, recommending approval',
  },
  {
    id: '4',
    client_name: 'Sarah Williams',
    submission_date: '2023-05-02',
    status: 'approved',
    submitted_by: 'Field Officer 3',
    last_updated: '2023-05-06',
    notes: 'First-time home buyer',
    manager_feedback: 'Verified income documents',
    director_feedback: 'Approved with standard terms',
    ceo_feedback: 'Final approval granted',
  },
];

const DataCollectionDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<ClientData[]>(mockClientData);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Get user role from metadata
  useEffect(() => {
    if (user?.user_metadata?.role) {
      setUserRole(user.user_metadata.role);
    }
  }, [user]);

  // Function to update client data status
  const updateClientStatus = (id: string, newStatus: ClientDataStatus, feedback: string = '') => {
    setClientData(prevData => 
      prevData.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, status: newStatus, last_updated: new Date().toISOString().split('T')[0] };
          
          // Add appropriate feedback based on role
          if (userRole === 'manager' && newStatus === 'director_reviewing') {
            updatedItem.manager_feedback = feedback;
          } else if (userRole === 'director' && newStatus === 'ceo_reviewing') {
            updatedItem.director_feedback = feedback;
          } else if (userRole === 'ceo') {
            updatedItem.ceo_feedback = feedback;
          }
          
          return updatedItem;
        }
        return item;
      })
    );

    toast({
      title: "Status Updated",
      description: `Client data status has been updated to ${newStatus.replace('_', ' ')}.`,
    });
  };

  // Get filtered data based on user role
  const getFilteredData = () => {
    switch (userRole) {
      case 'field_officer':
        return clientData;
      case 'manager':
        return clientData.filter(item => 
          item.status === 'pending' || 
          item.status === 'manager_reviewing' || 
          item.submitted_by.includes('Field Officer')
        );
      case 'director':
        return clientData.filter(item => 
          item.status === 'manager_reviewing' || 
          item.status === 'director_reviewing' ||
          item.status === 'ceo_reviewing' ||
          item.status === 'approved' ||
          item.status === 'rejected'
        );
      case 'ceo':
        return clientData.filter(item => 
          item.status === 'director_reviewing' || 
          item.status === 'ceo_reviewing' || 
          item.status === 'approved' || 
          item.status === 'rejected'
        );
      default:
        return [];
    }
  };

  // Render action buttons based on role and current status
  const renderActionButtons = (client: ClientData) => {
    if (userRole === 'field_officer') {
      return (
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled>Submitted</Button>
        </div>
      );
    } else if (userRole === 'manager' && (client.status === 'pending' || client.status === 'manager_reviewing')) {
      return (
        <div className="space-x-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => updateClientStatus(client.id, 'rejected', 'Rejected by manager')}
          >
            <XCircle className="mr-1" size={16} /> Reject
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => updateClientStatus(client.id, 'director_reviewing', 'Approved by manager')}
          >
            <CheckCircle className="mr-1" size={16} /> Approve
          </Button>
        </div>
      );
    } else if (userRole === 'director' && client.status === 'director_reviewing') {
      return (
        <div className="space-x-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => updateClientStatus(client.id, 'rejected', 'Rejected by director')}
          >
            <XCircle className="mr-1" size={16} /> Reject
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => updateClientStatus(client.id, 'ceo_reviewing', 'Approved by director')}
          >
            <CheckCircle className="mr-1" size={16} /> Approve
          </Button>
        </div>
      );
    } else if (userRole === 'ceo' && client.status === 'ceo_reviewing') {
      return (
        <div className="space-x-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => updateClientStatus(client.id, 'rejected', 'Rejected by CEO')}
          >
            <XCircle className="mr-1" size={16} /> Reject
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => updateClientStatus(client.id, 'approved', 'Approved by CEO')}
          >
            <CheckCircle className="mr-1" size={16} /> Approve
          </Button>
        </div>
      );
    } else {
      // For already processed items or items not in the current user's workflow
      return (
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled>
            {client.status === 'approved' ? 
              <><CheckCircle className="mr-1" size={16} /> Approved</> : 
              client.status === 'rejected' ? 
              <><XCircle className="mr-1" size={16} /> Rejected</> : 
              <><Clock className="mr-1" size={16} /> In Progress</>
            }
          </Button>
        </div>
      );
    }
  };

  // Get status badge style
  const getStatusBadge = (status: ClientDataStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Pending</span>;
      case 'manager_reviewing':
        return <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Manager Review</span>;
      case 'director_reviewing':
        return <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">Director Review</span>;
      case 'ceo_reviewing':
        return <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">CEO Review</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Client Data Collection Dashboard</h1>
            <p className="text-gray-600">
              {userRole && (
                <span className="flex items-center mt-2">
                  <Shield className="mr-2" size={18} />
                  Role: <span className="font-semibold ml-1 capitalize">{userRole.replace('_', ' ')}</span>
                </span>
              )}
            </p>
          </div>
          
          {userRole === 'field_officer' && (
            <DataCollectionButton />
          )}
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Workflow Process</CardTitle>
            <CardDescription>
              Client data goes through a multi-step approval workflow from Field Officer to CEO.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4 text-center">
              <div className="flex-1 min-w-[120px]">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                  <ClipboardCheck className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium">Field Officer</h3>
                <p className="text-xs text-gray-500">Collects Data</p>
              </div>
              <div className="hidden md:block text-gray-400">→</div>
              <div className="flex-1 min-w-[120px]">
                <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium">Manager</h3>
                <p className="text-xs text-gray-500">Reviews Data</p>
              </div>
              <div className="hidden md:block text-gray-400">→</div>
              <div className="flex-1 min-w-[120px]">
                <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-medium">Director</h3>
                <p className="text-xs text-gray-500">Further Review</p>
              </div>
              <div className="hidden md:block text-gray-400">→</div>
              <div className="flex-1 min-w-[120px]">
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium">CEO</h3>
                <p className="text-xs text-gray-500">Final Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Table>
              <TableCaption>Client data collection records</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData().map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.client_name}</TableCell>
                    <TableCell>{client.submission_date}</TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>{client.submitted_by}</TableCell>
                    <TableCell>{client.last_updated}</TableCell>
                    <TableCell>{renderActionButtons(client)}</TableCell>
                  </TableRow>
                ))}
                {getFilteredData().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <Table>
              <TableCaption>Pending client data</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData()
                  .filter(client => client.status === 'pending')
                  .map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.client_name}</TableCell>
                      <TableCell>{client.submission_date}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>{client.submitted_by}</TableCell>
                      <TableCell>{renderActionButtons(client)}</TableCell>
                    </TableRow>
                  ))}
                {getFilteredData().filter(client => client.status === 'pending').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No pending records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="in_progress" className="space-y-4">
            <Table>
              <TableCaption>In progress client data</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData()
                  .filter(client => 
                    ['manager_reviewing', 'director_reviewing', 'ceo_reviewing'].includes(client.status)
                  )
                  .map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.client_name}</TableCell>
                      <TableCell>{client.submission_date}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>{client.submitted_by}</TableCell>
                      <TableCell>{renderActionButtons(client)}</TableCell>
                    </TableRow>
                  ))}
                {getFilteredData().filter(client => 
                  ['manager_reviewing', 'director_reviewing', 'ceo_reviewing'].includes(client.status)
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No in-progress records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <Table>
              <TableCaption>Completed client data</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData()
                  .filter(client => ['approved', 'rejected'].includes(client.status))
                  .map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.client_name}</TableCell>
                      <TableCell>{client.submission_date}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>{client.submitted_by}</TableCell>
                      <TableCell>{client.last_updated}</TableCell>
                    </TableRow>
                  ))}
                {getFilteredData().filter(client => 
                  ['approved', 'rejected'].includes(client.status)
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No completed records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DataCollectionDashboard;
