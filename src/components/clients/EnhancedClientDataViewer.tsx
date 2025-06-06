
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  RefreshCw, 
  Eye, 
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useEnhancedClientData } from '@/hooks/use-enhanced-client-data';
import { useClientRealtime } from '@/hooks/use-client-realtime';
import { EnhancedClient } from '@/types/client';

const EnhancedClientDataViewer: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Set up real-time subscriptions
  useClientRealtime();

  const { data: clients = [], isLoading, error, refetch } = useEnhancedClientData();

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.phone_number?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.id_number?.toLowerCase().includes(searchLower)
    );
  });

  const categorizedClients = {
    all: filteredClients,
    with_applications: filteredClients.filter(client => (client.total_applications || 0) > 0),
    active_loans: filteredClients.filter(client => (client.active_applications || 0) > 0),
    approved_loans: filteredClients.filter(client => (client.approved_loans || 0) > 0),
  };

  const currentClients = categorizedClients[activeTab as keyof typeof categorizedClients];

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Client data has been updated with latest loan information"
    });
  };

  const formatCurrency = (amount: number): string => {
    return `UGX ${amount?.toLocaleString() || '0'}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disbursed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="font-medium">Error Loading Client Data</p>
            <p className="text-sm text-gray-600 mt-1">{error.message}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Enhanced Client Data ({clients.length})
              <Badge variant="outline" className="ml-2">
                Live Updates
              </Badge>
            </CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, phone, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client Categories */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All Clients ({categorizedClients.all.length})
              </TabsTrigger>
              <TabsTrigger value="with_applications">
                With Applications ({categorizedClients.with_applications.length})
              </TabsTrigger>
              <TabsTrigger value="active_loans">
                Active Loans ({categorizedClients.active_loans.length})
              </TabsTrigger>
              <TabsTrigger value="approved_loans">
                Approved ({categorizedClients.approved_loans.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : currentClients.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No clients found' : 'No clients in this category'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Clients will appear here when they match the selected category'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          currentClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))
        )}
      </div>
    </div>
  );
};

// Separate component for better organization
const ClientCard: React.FC<{ client: EnhancedClient }> = ({ client }) => {
  const formatCurrency = (amount: number) => `UGX ${amount?.toLocaleString() || '0'}`;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disbursed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{client.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {client.status && (
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                )}
                {(client.total_applications || 0) > 0 && (
                  <Badge variant="outline">
                    {client.total_applications} Applications
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {client.phone_number || 'No phone'}
            </div>
            {client.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {client.email}
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {client.address || 'No address'}
            </div>
          </div>

          {/* Loan Applications Summary */}
          {(client.total_applications || 0) > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Loan Applications:</span>
                <span className="font-medium">{client.total_applications}</span>
              </div>
              {(client.active_applications || 0) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {client.active_applications}
                  </Badge>
                </div>
              )}
              {(client.approved_loans || 0) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Approved:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {client.approved_loans}
                  </Badge>
                </div>
              )}
              {(client.total_loan_amount || 0) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(client.total_loan_amount || 0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recent Applications */}
          {client.loan_applications && client.loan_applications.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Recent Applications:</h4>
              <div className="space-y-2">
                {client.loan_applications.slice(0, 2).map((app) => (
                  <div key={app.id} className="flex items-center justify-between text-xs">
                    <span className="truncate">{app.loan_type}</span>
                    <Badge className={getApplicationStatusColor(app.status)}>
                      {app.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Details */}
          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">ID Number:</span>
              <span className="font-medium">{client.id_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employment:</span>
              <span className="font-medium">{client.employment_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Income:</span>
              <span className="font-medium">{formatCurrency(client.monthly_income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Joined:</span>
              <span className="font-medium">
                {new Date(client.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={`/client/${client.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details & Applications
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedClientDataViewer;
