
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
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Users,
  Briefcase,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
    } else {
      // Default role for authenticated users without specific role
      setUserRole('field_officer');
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
        return clientData;
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
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50">Pending</Badge>;
      case 'manager_reviewing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50">Manager Review</Badge>;
      case 'director_reviewing':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50">Director Review</Badge>;
      case 'ceo_reviewing':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50">CEO Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  // Get current role display
  const getRoleDisplay = () => {
    switch (userRole) {
      case 'field_officer':
        return (
          <div className="flex items-center bg-blue-50 dark:bg-blue-950/40 px-3 py-2 rounded-md">
            <Briefcase className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
            <span className="text-blue-700 dark:text-blue-400 font-medium">Field Officer</span>
            <BadgeCheck className="ml-2 text-blue-500 dark:text-blue-400" size={16} />
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center bg-purple-50 dark:bg-purple-950/40 px-3 py-2 rounded-md">
            <Briefcase className="text-purple-600 dark:text-purple-400 mr-2" size={18} />
            <span className="text-purple-700 dark:text-purple-400 font-medium">Manager</span>
            <BadgeCheck className="ml-2 text-purple-500 dark:text-purple-400" size={16} />
          </div>
        );
      case 'director':
        return (
          <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-md">
            <Briefcase className="text-indigo-600 dark:text-indigo-400 mr-2" size={18} />
            <span className="text-indigo-700 dark:text-indigo-400 font-medium">Director</span>
            <BadgeCheck className="ml-2 text-indigo-500 dark:text-indigo-400" size={16} />
          </div>
        );
      case 'ceo':
        return (
          <div className="flex items-center bg-green-50 dark:bg-green-950/40 px-3 py-2 rounded-md">
            <Briefcase className="text-green-600 dark:text-green-400 mr-2" size={18} />
            <span className="text-green-700 dark:text-green-400 font-medium">CEO</span>
            <BadgeCheck className="ml-2 text-green-500 dark:text-green-400" size={16} />
          </div>
        );
      default:
        return (
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
            <User className="text-gray-600 dark:text-gray-400 mr-2" size={18} />
            <span className="text-gray-700 dark:text-gray-400 font-medium">Authenticated User</span>
            <BadgeCheck className="ml-2 text-gray-500 dark:text-gray-400" size={16} />
          </div>
        );
    }
  };
  
  // Render workflow visualization
  const WorkflowVisualization = () => (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center">
          <ClipboardCheck className="mr-2" size={20} />
          Client Data Workflow
        </CardTitle>
        <CardDescription>
          Client data goes through a structured approval process from collection to final decision.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 text-center">
          {/* Step 1: Field Officer */}
          <div className="flex flex-col items-center min-w-[120px] relative">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <ClipboardCheck className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium">Field Officer</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <div>Data Collection</div>
              <div className="text-blue-600 dark:text-blue-500 font-medium mt-1">Client Details</div>
            </div>
            <div className="hidden lg:block absolute top-6 -right-4 z-10">
              <ArrowRight className="text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Step 1.5: Onboarding Details */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md min-w-[200px] lg:mx-2">
            <h4 className="font-medium text-sm mb-2 text-blue-600 dark:text-blue-400">Onboarding & Due Diligence</h4>
            <ul className="text-xs text-left space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Client Personal Details</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Guarantors Information</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Documentation Verification</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Loan Details & Requirements</span>
              </li>
            </ul>
          </div>
          
          {/* Step 2: Manager */}
          <div className="flex flex-col items-center min-w-[120px] relative">
            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <Users className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium">Manager</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Initial Review</p>
            <div className="hidden lg:block absolute top-6 -right-4 z-10">
              <ArrowRight className="text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Step 3: Director */}
          <div className="flex flex-col items-center min-w-[120px] relative">
            <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <Users className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-medium">Director</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk Assessment</p>
            <div className="hidden lg:block absolute top-6 -right-4 z-10">
              <ArrowRight className="text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Step 4: CEO */}
          <div className="flex flex-col items-center min-w-[120px]">
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <Users className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium">CEO</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Final Approval</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Client Data Collection Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {getRoleDisplay()}
            </p>
          </div>
          
          <DataCollectionButton />
        </div>
        
        <WorkflowVisualization />
        
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
