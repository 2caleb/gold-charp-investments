
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const clientFormSchema = z.object({
  full_name: z.string().min(3, "Name must be at least 3 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  id_number: z.string().min(5, "ID number must be at least 5 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  employment_status: z.enum(["employed", "self-employed", "unemployed", "student", "retired"]),
  monthly_income: z.string().min(1, "Monthly income is required"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const ClientForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      id_number: "",
      address: "",
      employment_status: "employed",
      monthly_income: "",
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit this form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert monthly_income from string to number
      const numericIncome = parseFloat(values.monthly_income.replace(/,/g, ''));
      
      // Use the Edge Function to insert client data
      const response = await fetch('https://bjsxekgraxbfqzhbqjff.functions.supabase.co/insert-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
        },
        body: JSON.stringify({
          p_full_name: values.full_name,
          p_phone_number: values.phone_number,
          p_email: values.email || null,
          p_id_number: values.id_number,
          p_address: values.address,
          p_employment_status: values.employment_status,
          p_monthly_income: numericIncome,
          p_user_id: user.id
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Client added successfully",
        description: "The client information has been saved",
        variant: "default",
      });

      // Redirect to client profile or list
      navigate('/clients');
    } catch (error: any) {
      console.error('Error submitting client form:', error);
      toast({
        title: "Failed to add client",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <Separator />
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+256 700 123456" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include country code
                    </FormDescription>
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
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="ID12345678" {...field} />
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
                    <Textarea placeholder="Street, City, District" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-medium mt-6">Financial Information</h3>
            <Separator />

            <FormField
              control={form.control}
              name="employment_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
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
                    <Input placeholder="e.g. 1,500,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Client Information"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ClientForm;
