
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinancialAdjustments } from '@/hooks/use-financial-adjustments';

const formSchema = z.object({
  adjustment_type: z.enum(['income_adjustment', 'expense_adjustment', 'portfolio_adjustment', 'collection_rate_override']),
  original_value: z.number().min(0, 'Original value must be positive'),
  adjusted_value: z.number().min(0, 'Adjusted value must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  effective_date: z.string().optional(),
  expires_at: z.string().optional(),
});

interface FinancialAdjustmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FinancialAdjustmentForm: React.FC<FinancialAdjustmentFormProps> = ({ onClose, onSuccess }) => {
  const { createAdjustment, isCreating } = useFinancialAdjustments();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjustment_type: 'income_adjustment',
      original_value: 0,
      adjusted_value: 0,
      reason: '',
      effective_date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Type assertion after validation to ensure required fields are present
    const adjustmentData = {
      adjustment_type: values.adjustment_type,
      original_value: values.original_value,
      adjusted_value: values.adjusted_value,
      reason: values.reason,
      effective_date: values.effective_date,
      expires_at: values.expires_at,
    };
    
    createAdjustment(adjustmentData);
    onSuccess();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Financial Adjustment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income_adjustment">Income Adjustment</SelectItem>
                      <SelectItem value="expense_adjustment">Expense Adjustment</SelectItem>
                      <SelectItem value="portfolio_adjustment">Portfolio Adjustment</SelectItem>
                      <SelectItem value="collection_rate_override">Collection Rate Override</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="original_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adjusted_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjusted Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Adjustment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why this adjustment is necessary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effective_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Adjustment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialAdjustmentForm;
