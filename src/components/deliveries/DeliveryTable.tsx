import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar,
  Package,
  DollarSign,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/utils/currencyUtils';
import type { EggDelivery, DeliveryFilters } from '@/types/delivery';

interface DeliveryTableProps {
  deliveries: EggDelivery[];
  isLoading: boolean;
  onEdit: (delivery: EggDelivery) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  isDeleting: boolean;
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  isLoading,
  onEdit,
  onDelete,
  onExport,
  isDeleting,
}) => {
  const [filters, setFilters] = useState<DeliveryFilters>({
    supplier_name: '',
    payment_status: 'all',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Filter deliveries based on current filters
  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSupplier = !filters.supplier_name || 
      delivery.supplier_name.toLowerCase().includes(filters.supplier_name.toLowerCase());
    
    const matchesStatus = filters.payment_status === 'all' || 
      delivery.payment_status === filters.payment_status;

    return matchesSupplier && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Deliveries...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Records ({filteredDeliveries.length})
          </span>
          <Button onClick={onExport} variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by supplier name..."
              value={filters.supplier_name}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier_name: e.target.value }))}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.payment_status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, payment_status: value as any }))}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead className="text-center">Trays</TableHead>
                <TableHead className="text-right">Price/Tray</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <React.Fragment key={delivery.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(delivery.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {delivery.supplier_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(delivery.delivery_date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {delivery.trays}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(delivery.price_per_tray)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(delivery.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPaymentStatusBadge(delivery.payment_status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(delivery)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Delivery Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this delivery record for {delivery.supplier_name}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(delivery.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row Details */}
                    {expandedRows.has(delivery.id) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {delivery.phone_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{delivery.phone_number}</span>
                              </div>
                            )}
                            {delivery.delivery_location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{delivery.delivery_location}</span>
                              </div>
                            )}
                            <div className="text-muted-foreground">
                              Created: {format(new Date(delivery.created_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                            {delivery.notes && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <strong>Notes:</strong> {delivery.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {deliveries.length === 0 ? 'No delivery records found' : 'No records match your filters'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTable;