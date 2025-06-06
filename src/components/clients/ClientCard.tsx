
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedClient } from '@/types/client';
import { getApplicationStatusCategory } from '@/utils/clientStatistics';

interface ClientCardProps {
  client: EnhancedClient;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const formatCurrency = (amount: number) => `UGX ${amount?.toLocaleString() || '0'}`;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    const category = getApplicationStatusCategory(status);
    switch (category) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

          {/* Enhanced Loan Applications Summary */}
          {(client.total_applications || 0) > 0 && (
            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{client.total_applications}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">{client.active_applications || 0}</div>
                  <div className="text-xs text-yellow-600">Active</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{client.approved_loans || 0}</div>
                  <div className="text-xs text-green-600">Approved</div>
                </div>
              </div>
              
              {(client.total_loan_amount || 0) > 0 && (
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-medium text-purple-600">
                    {formatCurrency(client.total_loan_amount || 0)}
                  </div>
                  <div className="text-xs text-purple-600">Total Loan Value</div>
                </div>
              )}
            </div>
          )}

          {/* Recent Applications with Enhanced Status */}
          {client.loan_applications && client.loan_applications.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Recent Applications:</h4>
              <div className="space-y-2">
                {client.loan_applications.slice(0, 2).map((app) => (
                  <div key={app.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium truncate">{app.loan_type}</div>
                      <div className="text-gray-500">{formatCurrency(parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0)}</div>
                    </div>
                    <Badge className={getApplicationStatusColor(app.status)}>
                      {getApplicationStatusCategory(app.status)}
                    </Badge>
                  </div>
                ))}
                {client.loan_applications.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{client.loan_applications.length - 2} more applications
                  </div>
                )}
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
                View Full Details & Loan Performance
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
