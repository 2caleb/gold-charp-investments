
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
  BadgeCheck,
  FileImage,
  Camera,
  MessageSquare,
  FileScan,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  rating?: number;
  documents_complete?: number;
  has_photos?: boolean;
  has_videos?: boolean;
  has_scans?: boolean;
  messages_count?: number;
}

// Mock data with new fields for media and documentation completeness
const mockClientData: ClientData[] = [
  {
    id: '1',
    client_name: 'John Smith',
    submission_date: '2023-05-10',
    status: 'pending',
    submitted_by: 'Field Officer 1',
    last_updated: '2023-05-10',
    notes: 'Client looking for mortgage options',
    rating: 3,
    documents_complete: 40,
    has_photos: true,
    has_videos: false, 
    has_scans: true,
    messages_count: 2
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
    rating: 4,
    documents_complete: 70,
    has_photos: true,
    has_videos: true,
    has_scans: true,
    messages_count: 5
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
    rating: 5,
    documents_complete: 95,
    has_photos: true,
    has_videos: true,
    has_scans: true,
    messages_count: 8
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
    rating: 5,
    documents_complete: 100,
    has_photos: true,
    has_videos: true,
    has_scans: true,
    messages_count: 12
  },
  {
    id: '5',
    client_name: 'David Wilson',
    submission_date: '2023-05-01',
    status: 'rejected',
    submitted_by: 'Field Officer 2',
    last_updated: '2023-05-04',
    notes: 'Unable to provide sufficient income proof',
    manager_feedback: 'Income documents insufficient',
    director_feedback: 'Does not meet loan requirements',
    rating: 2,
    documents_complete: 30,
    has_photos: true,
    has_videos: false,
    has_scans: false,
    messages_count: 6
  },
];

const DataCollectionDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<ClientData[]>(mockClientData);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [viewingClient, setViewingClient] = useState<ClientData | null>(null);
  const [viewDialog, setViewDialog] = useState<'media' | 'feedback' | null>(null);
  
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
  
  // Function to get rating stars display
  const getRatingStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-yellow-500" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-500 fill-yellow-500" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };
  
  // Display media icons based on client data
  const getMediaIcons = (client: ClientData) => {
    return (
      <div className="flex items-center space-x-1">
        {client.has_photos && <Camera size={16} className="text-blue-500" />}
        {client.has_videos && <FileImage size={16} className="text-purple-500" />}
        {client.has_scans && <FileScan size={16} className="text-green-500" />}
        {client.messages_count && client.messages_count > 0 && (
          <div className="flex items-center">
            <MessageSquare size={16} className="text-indigo-500" />
            <span className="text-xs ml-1">{client.messages_count}</span>
          </div>
        )}
      </div>
    );
  };
  
  // View client media dialog
  const ClientMediaDialog = () => {
    if (!viewingClient) return null;
    
    // Mock media data for demonstration
    const mockPhotos = [
      'https://via.placeholder.com/400x300?text=Client+Photo+1',
      'https://via.placeholder.com/400x300?text=Client+Photo+2',
      'https://via.placeholder.com/400x300?text=Client+Photo+3',
    ];
    
    const mockVideos = [
      'https://via.placeholder.com/400x300?text=Client+Video+1',
    ];
    
    const mockScans = [
      { id: '1', name: 'National ID.pdf', url: '#' },
      { id: '2', name: 'Bank Statement.pdf', url: '#' },
      { id: '3', name: 'Proof of Income.pdf', url: '#' },
    ];
    
    const mockMessages = [
      { sender: 'Field Officer', message: 'Client visit completed. All documents collected.', timestamp: '2023-05-10T10:30:00Z' },
      { sender: 'Manager', message: 'Good job. Did you verify their employment?', timestamp: '2023-05-10T11:15:00Z' },
      { sender: 'Field Officer', message: 'Yes, I contacted their employer and confirmed.', timestamp: '2023-05-10T11:30:00Z' },
    ];
    
    return (
      <Dialog open={viewDialog === 'media'} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingClient.client_name}'s Documentation</DialogTitle>
            <DialogDescription>
              Photos, videos, scanned documents, and communication history
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Photos section */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Camera size={18} /> 
                  Photos ({mockPhotos.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mockPhotos.map((photo, idx) => (
                    <div key={idx} className="border rounded-md overflow-hidden">
                      <AspectRatio ratio={4/3}>
                        <img src={photo} alt={`Client photo ${idx+1}`} className="object-cover w-full h-full" />
                      </AspectRatio>
                      <div className="p-2 text-xs">Photo {idx+1}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Videos section */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileImage size={18} /> 
                  Videos ({mockVideos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockVideos.map((video, idx) => (
                    <div key={idx} className="border rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center">
                        <div className="text-center">
                          <FileImage size={32} className="mx-auto mb-2 text-purple-500" />
                          <span className="text-sm">Video {idx+1}</span>
                        </div>
                      </div>
                      <div className="p-2 text-xs flex justify-between">
                        <span>Video {idx+1}</span>
                        <Button size="sm" variant="ghost">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scanned documents section */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileScan size={18} /> 
                  Scanned Documents ({mockScans.length})
                </h3>
                <div className="space-y-2">
                  {mockScans.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <FileScan size={18} className="text-green-500" />
                        <span>{doc.name}</span>
                      </div>
                      <Button size="sm" variant="outline">View Document</Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Communication history */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageSquare size={18} /> 
                  Communication History ({mockMessages.length} messages)
                </h3>
                <div className="border rounded-md p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
                  {mockMessages.map((msg, idx) => (
                    <div key={idx} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium">{msg.sender}</span>
                        <time>{new Date(msg.timestamp).toLocaleString()}</time>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };
  
  // View client feedback dialog
  const ClientFeedbackDialog = () => {
    if (!viewingClient) return null;
    
    return (
      <Dialog open={viewDialog === 'feedback'} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingClient.client_name}</DialogTitle>
            <DialogDescription>
              Application details and feedback history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Rating:</span>
                {getRatingStars(viewingClient.rating || 0)}
              </div>
              <Badge 
                variant="outline" 
                className={
                  viewingClient.status === 'approved' ? "bg-green-100 text-green-800" :
                  viewingClient.status === 'rejected' ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }
              >
                {viewingClient.status.charAt(0).toUpperCase() + viewingClient.status.slice(1).replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-2">Application Notes</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{viewingClient.notes}</p>
            </div>
            
            {viewingClient.manager_feedback && (
              <div className="p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-400">Manager Feedback</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">{viewingClient.manager_feedback}</p>
              </div>
            )}
            
            {viewingClient.director_feedback && (
              <div className="p-3 border rounded-md bg-purple-50 dark:bg-purple-900/20">
                <h3 className="text-sm font-medium mb-2 text-purple-700 dark:text-purple-400">Director Feedback</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">{viewingClient.director_feedback}</p>
              </div>
            )}
            
            {viewingClient.ceo_feedback && (
              <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                <h3 className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">CEO Feedback</h3>
                <p className="text-sm text-green-700 dark:text-green-400">{viewingClient.ceo_feedback}</p>
              </div>
            )}
            
            <div className="p-3 border rounded-md">
              <h3 className="text-sm font-medium mb-2">Documentation Completeness</h3>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className={`h-2.5 rounded-full ${
                      (viewingClient.documents_complete || 0) >= 80 ? "bg-green-500" :
                      (viewingClient.documents_complete || 0) >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`} 
                    style={{ width: `${viewingClient.documents_complete || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{viewingClient.documents_complete || 0}%</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Photos & Videos from Site Visit</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Scanned Document Upload</span>
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
                  <TableHead>Rating</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData().map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.client_name}</TableCell>
                    <TableCell>{client.submission_date}</TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>{getRatingStars(client.rating)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2" style={{width: "50px"}}>
                          <div 
                            className={`h-2 rounded-full ${
                              (client.documents_complete || 0) >= 80 ? "bg-green-500" :
                              (client.documents_complete || 0) >= 50 ? "bg-yellow-500" : "bg-red-500"
                            }`} 
                            style={{ width: `${client.documents_complete || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{client.documents_complete || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMediaIcons(client)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {renderActionButtons(client)}
                        <div className="space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => {
                              setViewingClient(client);
                              setViewDialog('media');
                            }}
                          >
                            <Camera size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => {
                              setViewingClient(client);
                              setViewDialog('feedback');
                            }}
                          >
                            <ClipboardCheck size={16} />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {getFilteredData().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
        
        {/* Client media and feedback dialogs */}
        <ClientMediaDialog />
        <ClientFeedbackDialog />
      </div>
    </Layout>
  );
};

export default DataCollectionDashboard;
