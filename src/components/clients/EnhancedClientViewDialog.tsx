
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedClientViewDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedClientViewDialog: React.FC<EnhancedClientViewDialogProps> = ({
  clientId,
  open,
  onOpenChange
}) => {
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client-detail', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_name')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId && open,
  });

  const { data: loanApplications, isLoading: loansLoading } = useQuery({
    queryKey: ['client-loans', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId && open,
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending_manager': return 'bg-yellow-100 text-yellow-800';
      case 'pending_director': return 'bg-orange-100 text-orange-800';
      case 'pending_ceo': return 'bg-purple-100 text-purple-800';
      case 'pending_chairperson': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'employed': return 'bg-green-100 text-green-800';
      case 'self-employed': return 'bg-blue-100 text-blue-800';
      case 'business owner': return 'bg-purple-100 text-purple-800';
      case 'unemployed': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <User className="mr-2 h-6 w-6" />
            Client Details
          </DialogTitle>
        </DialogHeader>

        {clientLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Loading client information...</span>
          </div>
        ) : client ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold">{client.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">ID Number</p>
                        <p className="font-semibold">{client.id_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-semibold">{client.phone_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold">{client.email || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-semibold">{client.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Client Since</p>
                        <p className="font-semibold">
                          {format(new Date(client.created_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Employment Status</p>
                      <Badge className={getEmploymentStatusColor(client.employment_status)}>
                        {client.employment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Monthly Income</p>
                      <p className="font-semibold text-lg">
                        UGX {formatCurrency(client.monthly_income)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Loan Applications ({loanApplications?.length || 0})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loansLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading loan applications...</span>
                  </div>
                ) : loanApplications && loanApplications.length > 0 ? (
                  <div className="space-y-4">
                    {loanApplications.map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">
                            UGX {formatCurrency(parseFloat(loan.loan_amount || '0'))}
                          </h4>
                          <Badge className={getStatusBadgeColor(loan.status)}>
                            {loan.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Loan Type</p>
                            <p className="font-medium capitalize">{loan.loan_type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Purpose</p>
                            <p className="font-medium">{loan.purpose_of_loan}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Application Date</p>
                            <p className="font-medium">
                              {format(new Date(loan.created_at), 'PPP')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Current Stage</p>
                            <p className="font-medium capitalize">
                              {loan.status.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        {loan.notes && (
                          <div className="mt-3">
                            <p className="text-gray-500 text-sm">Notes</p>
                            <p className="text-sm">{loan.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No loan applications found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load client information</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedClientViewDialog;
