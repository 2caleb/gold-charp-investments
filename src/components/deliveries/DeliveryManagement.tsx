import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEggDeliveries } from '@/hooks/use-egg-deliveries';
import DeliveryDashboard from './DeliveryDashboard';
import DeliveryTable from './DeliveryTable';
import DeliveryForm from './DeliveryForm';
import type { EggDelivery, DeliveryFormData } from '@/types/delivery';

const DeliveryManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<EggDelivery | null>(null);

  const {
    deliveries,
    deliveryStats,
    isLoading,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEggDeliveries();

  const handleFormSubmit = (data: DeliveryFormData) => {
    if (editingDelivery) {
      updateDelivery({ id: editingDelivery.id, data });
    } else {
      createDelivery(data);
    }
    setIsFormOpen(false);
    setEditingDelivery(null);
  };

  const handleEdit = (delivery: EggDelivery) => {
    setEditingDelivery(delivery);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDelivery(id);
  };

  const handleExport = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('generate-delivery-report', {
        body: {
          format: 'excel',
          startDate: null,
          endDate: null,
          supplier: null,
          paymentStatus: 'all'
        }
      });

      if (error) throw error;

      // Create and download Excel file
      const { utils, writeFile } = await import('xlsx');
      const workbook = utils.book_new();
      const worksheet = utils.aoa_to_sheet(data.data);
      utils.book_append_sheet(workbook, worksheet, 'Deliveries');
      writeFile(workbook, data.filename);
      
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: 'Success',
        description: 'Delivery report exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: 'Error',
        description: 'Failed to export delivery report',
        variant: 'destructive',
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDelivery(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Egg Delivery Management</h2>
          <p className="text-muted-foreground">
            Track deliveries, suppliers, and payment status
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
      </div>

      {/* Dashboard */}
      {deliveryStats && (
        <DeliveryDashboard stats={deliveryStats} isLoading={isLoading} />
      )}

      {/* Table */}
      <DeliveryTable
        deliveries={deliveries}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        isDeleting={isDeleting}
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDelivery ? 'Edit Delivery' : 'New Delivery'}
            </DialogTitle>
          </DialogHeader>
          <DeliveryForm
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            initialData={editingDelivery || undefined}
            isSubmitting={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagement;