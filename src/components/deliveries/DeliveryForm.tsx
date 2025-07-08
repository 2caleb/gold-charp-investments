import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Package, Phone, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DeliveryFormData } from '@/types/delivery';

const deliverySchema = z.object({
  supplier_name: z.string().min(1, 'Supplier name is required'),
  phone_number: z.string().optional(),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  trays: z.number().min(1, 'Number of trays must be at least 1'),
  price_per_tray: z.number().min(0.01, 'Price per tray must be greater than 0'),
  payment_status: z.enum(['pending', 'paid', 'overdue']),
  delivery_location: z.string().optional(),
  notes: z.string().optional(),
});

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => void;
  onCancel: () => void;
  initialData?: Partial<DeliveryFormData>;
  isSubmitting?: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}) => {
  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      supplier_name: initialData?.supplier_name || '',
      phone_number: initialData?.phone_number || '',
      delivery_date: initialData?.delivery_date || format(new Date(), 'yyyy-MM-dd'),
      trays: initialData?.trays || 1,
      price_per_tray: initialData?.price_per_tray || 0,
      payment_status: initialData?.payment_status || 'pending',
      delivery_location: initialData?.delivery_location || '',
      notes: initialData?.notes || '',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const deliveryDate = watch('delivery_date');
  const trays = watch('trays');
  const pricePerTray = watch('price_per_tray');

  // Calculate total automatically
  const totalAmount = trays * pricePerTray;

  const handleFormSubmit = (data: DeliveryFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {initialData ? 'Edit Delivery' : 'New Egg Delivery'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier Name *</Label>
              <Input
                id="supplier_name"
                {...register('supplier_name')}
                placeholder="Enter supplier name"
                className={errors.supplier_name ? 'border-destructive' : ''}
              />
              {errors.supplier_name && (
                <p className="text-sm text-destructive">{errors.supplier_name.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone Number
              </Label>
              <Input
                id="phone_number"
                {...register('phone_number')}
                placeholder="Enter phone number"
                type="tel"
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground",
                      errors.delivery_date && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(new Date(deliveryDate), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate ? new Date(deliveryDate) : undefined}
                    onSelect={(date) => setValue('delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.delivery_date && (
                <p className="text-sm text-destructive">{errors.delivery_date.message}</p>
              )}
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Payment Status *</Label>
              <Select
                value={watch('payment_status')}
                onValueChange={(value) => setValue('payment_status', value as 'pending' | 'paid' | 'overdue')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Trays */}
            <div className="space-y-2">
              <Label htmlFor="trays">Number of Trays *</Label>
              <Input
                id="trays"
                {...register('trays', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="Enter number of trays"
                className={errors.trays ? 'border-destructive' : ''}
              />
              {errors.trays && (
                <p className="text-sm text-destructive">{errors.trays.message}</p>
              )}
            </div>

            {/* Price per Tray */}
            <div className="space-y-2">
              <Label htmlFor="price_per_tray">Price per Tray (UGX) *</Label>
              <Input
                id="price_per_tray"
                {...register('price_per_tray', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price per tray"
                className={errors.price_per_tray ? 'border-destructive' : ''}
              />
              {errors.price_per_tray && (
                <p className="text-sm text-destructive">{errors.price_per_tray.message}</p>
              )}
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                UGX {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="space-y-2">
            <Label htmlFor="delivery_location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Delivery Location
            </Label>
            <Input
              id="delivery_location"
              {...register('delivery_location')}
              placeholder="Enter delivery location"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Notes
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Delivery' : 'Create Delivery'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryForm;