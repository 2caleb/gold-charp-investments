
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  id_number: z.string().min(2, 'ID number is required'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  address: z.string().min(2, 'Address is required'),
  employment_status: z.string().min(1, 'Employment status is required'),
  monthly_income: z.number().min(1, 'Monthly income must be greater than 0'),
  nature_of_business: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const defaultValues: Partial<FormValues> = {
    full_name: '',
    id_number: '',
    phone_number: '',
    email: '',
    address: '',
    employment_status: '',
    monthly_income: 0,
    nature_of_business: '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('client_name').insert([
        {
          full_name: values.full_name,
          id_number: values.id_number,
          phone_number: values.phone_number,
          email: values.email || null,
          address: values.address,
          employment_status: values.employment_status,
          monthly_income: values.monthly_income,
          nature_of_business: values.nature_of_business,
          status: 'active',
        },
      ]).select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Client added successfully',
      });

      navigate('/clients');
    } catch (err: any) {
      console.error('Error creating client:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create client',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Number</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                    <SelectItem value="Business Owner">Business Owner</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthly_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Income (UGX)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nature_of_business"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nature of Business</FormLabel>
                <FormControl>
                  <Input placeholder="Retail, Manufacturing, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
