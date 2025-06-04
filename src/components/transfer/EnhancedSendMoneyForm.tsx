
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TransferFormData {
  recipient_id: string;
  send_amount: number;
  send_currency: string;
  receive_currency: string;
  transfer_method: string;
  purpose: string;
  pickup_location?: string;
}

interface FeeCalculation {
  sendAmount: number;
  serviceFee: number;
  netAmount: number;
  receiveAmount: number;
  exchangeRate: number;
  feePercentage: number;
}

const EnhancedSendMoneyForm = ({ exchangeRates }: { exchangeRates: any[] }) => {
  const { toast } = useToast();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransferFormData>();
  const [calculation, setCalculation] = useState<FeeCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const watchedValues = watch();

  // Fetch recipients
  const { data: recipients } = useQuery({
    queryKey: ['transfer-recipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_recipients')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate fees whenever form values change
  useEffect(() => {
    if (watchedValues.send_amount && watchedValues.send_currency && watchedValues.receive_currency) {
      calculateFees();
    }
  }, [watchedValues.send_amount, watchedValues.send_currency, watchedValues.receive_currency]);

  const calculateFees = async () => {
    setIsCalculating(true);
    try {
      const sendAmount = parseFloat(watchedValues.send_amount?.toString() || '0');
      if (sendAmount <= 0) {
        setCalculation(null);
        return;
      }

      // Service fee calculation (20% as per Python code)
      const feePercentage = 20.0;
      const serviceFee = Math.round((sendAmount * feePercentage / 100) * 100) / 100;
      const netAmount = Math.round((sendAmount - serviceFee) * 100) / 100;

      // Get exchange rate
      const rate = exchangeRates?.find(
        r => r.from_currency === watchedValues.send_currency && 
             r.to_currency === watchedValues.receive_currency
      )?.rate || 1;

      const receiveAmount = Math.round((netAmount * rate) * 100) / 100;

      setCalculation({
        sendAmount,
        serviceFee,
        netAmount,
        receiveAmount,
        exchangeRate: rate,
        feePercentage
      });
    } catch (error) {
      console.error('Fee calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const { data: result, error } = await supabase.functions.invoke('enhanced-money-transfer', {
        body: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: 'Transfer Initiated',
        description: `Transfer reference: ${result.reference}. Service fee: ${result.service_fee} ${watchedValues.send_currency}`,
      });
      // Reset form or redirect
    },
    onError: (error: any) => {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to process transfer',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    if (!calculation) {
      toast({
        title: 'Calculation Required',
        description: 'Please wait for fee calculation to complete',
        variant: 'destructive',
      });
      return;
    }

    transferMutation.mutate({
      ...data,
      send_amount: calculation.sendAmount
    });
  };

  const currencies = ['UGX', 'USD', 'ZAR'];
  const transferMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'cash_pickup', label: 'Cash Pickup' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Transfer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Send Money
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipient Selection */}
            <div className="space-y-2">
              <Label htmlFor="recipient_id">Recipient</Label>
              <Select onValueChange={(value) => setValue('recipient_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients?.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.full_name} - {recipient.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.recipient_id && (
                <p className="text-sm text-red-600">Please select a recipient</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="send_amount">Send Amount</Label>
              <Input
                id="send_amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="Enter amount"
                {...register('send_amount', { 
                  required: 'Amount is required',
                  min: { value: 1, message: 'Minimum amount is 1' }
                })}
              />
              {errors.send_amount && (
                <p className="text-sm text-red-600">{errors.send_amount.message}</p>
              )}
            </div>

            {/* Currencies */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="send_currency">Send Currency</Label>
                <Select onValueChange={(value) => setValue('send_currency', value)} defaultValue="UGX">
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receive_currency">Receive Currency</Label>
                <Select onValueChange={(value) => setValue('receive_currency', value)} defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transfer Method */}
            <div className="space-y-2">
              <Label htmlFor="transfer_method">Transfer Method</Label>
              <Select onValueChange={(value) => setValue('transfer_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {transferMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (Optional)</Label>
              <Textarea
                id="purpose"
                placeholder="Purpose of transfer"
                {...register('purpose')}
              />
            </div>

            {/* Pickup Location (if cash pickup) */}
            {watchedValues.transfer_method === 'cash_pickup' && (
              <div className="space-y-2">
                <Label htmlFor="pickup_location">Pickup Location</Label>
                <Input
                  id="pickup_location"
                  placeholder="Enter pickup location"
                  {...register('pickup_location')}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={transferMutation.isPending || !calculation}
            >
              {transferMutation.isPending ? 'Processing...' : 'Send Money'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Fee Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Transfer Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Calculating...</span>
            </div>
          ) : calculation ? (
            <div className="space-y-4">
              {/* Send Amount */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Send Amount:</span>
                <span className="font-semibold">
                  {calculation.sendAmount.toLocaleString()} {watchedValues.send_currency}
                </span>
              </div>

              {/* Service Fee */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Service Fee ({calculation.feePercentage}%):</span>
                <span className="font-semibold text-red-600">
                  -{calculation.serviceFee.toLocaleString()} {watchedValues.send_currency}
                </span>
              </div>

              <Separator />

              {/* Net Amount */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Amount Transferred:</span>
                <span className="font-semibold text-blue-600">
                  {calculation.netAmount.toLocaleString()} {watchedValues.send_currency}
                </span>
              </div>

              {/* Exchange Rate */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Exchange Rate:</span>
                <span className="font-semibold">
                  1 {watchedValues.send_currency} = {calculation.exchangeRate} {watchedValues.receive_currency}
                </span>
              </div>

              <Separator />

              {/* Receive Amount */}
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Recipient Receives:</span>
                <span className="font-bold text-lg text-green-600">
                  {calculation.receiveAmount.toLocaleString()} {watchedValues.receive_currency}
                </span>
              </div>

              {/* Warning about fees */}
              <div className="flex items-start p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Service Fee Notice</p>
                  <p>A {calculation.feePercentage}% service fee is applied to all transfers as per our pricing structure.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Enter transfer details to see calculation
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSendMoneyForm;
