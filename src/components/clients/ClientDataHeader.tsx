
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  RefreshCw, 
  Info,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface ClientDataHeaderProps {
  clientCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  onRefresh: () => void;
  categorizedClients: {
    all: any[];
    with_applications: any[];
    active_loans: any[];
    approved_loans: any[];
  };
  totalActiveApps: number;
  totalApprovedLoans: number;
}

const ClientDataHeader: React.FC<ClientDataHeaderProps> = ({
  clientCount,
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  onRefresh,
  categorizedClients,
  totalActiveApps,
  totalApprovedLoans
}) => {
  const totalClientsWithApps = categorizedClients.with_applications.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Enhanced Client Data ({clientCount})
            <Badge variant="outline" className="ml-2">
              Sophisticated Matching
            </Badge>
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        {/* Data Quality Indicator */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>With Apps: {totalClientsWithApps}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Active: {totalActiveApps}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>Approved: {totalApprovedLoans}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients by name, phone, email, or ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Client Categories */}
        <Tabs value={activeTab} onValueChange={onTabChange}>
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
  );
};

export default ClientDataHeader;
