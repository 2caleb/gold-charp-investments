
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedClientData } from '@/hooks/use-enhanced-client-data';
import { useClientRealtime } from '@/hooks/use-client-realtime';
import ClientDataHeader from './ClientDataHeader';
import ClientGrid from './ClientGrid';

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
      description: "Client data has been updated with sophisticated matching algorithm"
    });
  };

  // Calculate summary statistics
  const totalActiveApplications = clients.reduce((sum, client) => sum + (client.active_applications || 0), 0);
  const totalApprovedLoans = clients.reduce((sum, client) => sum + (client.approved_loans || 0), 0);

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
      <ClientDataHeader
        clientCount={clients.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        categorizedClients={categorizedClients}
        totalActiveApps={totalActiveApplications}
        totalApprovedLoans={totalApprovedLoans}
      />

      <ClientGrid
        clients={currentClients}
        isLoading={isLoading}
        searchTerm={searchTerm}
        activeTab={activeTab}
      />
    </div>
  );
};

export default EnhancedClientDataViewer;
