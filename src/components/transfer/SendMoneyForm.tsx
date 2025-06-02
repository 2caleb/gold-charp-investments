
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, DollarSign, Clock, Shield } from 'lucide-react';

interface SendMoneyFormProps {
  exchangeRates: any[];
}

const SendMoneyForm: React.FC<SendMoneyFormProps> = ({ exchangeRates }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sendAmount: '',
    sendCurrency: 'UGX',
    receiveCurrency: 'USD',
    transferMethod: 'bank_transfer',
    purpose: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientCountry: '',
    recipientCity: '',
    recipientAddress: '',
    bankName: '',
    accountNumber: ''
  });

  const [calculation, setCalculation] = useState({
    receiveAmount: 0,
    exchangeRate: 0,
    transferFee: 0,
    totalAmount: 0
  });

  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's saved recipients
  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    const { data, error } = await supabase
      .from('transfer_recipients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecipients(data);
    }
  };

  // Calculate transfer details when amount or currencies change
  useEffect(() => {
    if (formData.sendAmount && exchangeRates.length > 0) {
      calculateTransfer();
    }
  }, [formData.sendAmount, formData.sendCurrency, formData.receiveCurrency, formData.transferMethod, exchangeRates]);

  const calculateTransfer = async () => {
    const sendAmount = parseFloat(formData.sendAmount);
    if (!sendAmount) return;

    // Find exchange rate
    const rate = exchangeRates.find(r => 
      r.from_currency === formData.sendCurrency && 
      r.to_currency === formData.receiveCurrency
    )?.rate || 1;

    // Calculate fees
    const { data: feeStructure } = await supabase
      .from('transfer_fees')
      .select('*')
      .eq('transfer_method', formData.transferMethod)
      .eq('currency', formData.sendCurrency)
      .lte('amount_min', sendAmount)
      .gte('amount_max', sendAmount)
      .single();

    const fee = feeStructure 
      ? (feeStructure.fixed_fee || 0) + (sendAmount * (feeStructure.fee_percentage || 0) / 100)
      : sendAmount * 0.02; // Default 2% fee

    const receiveAmount = sendAmount * rate;
    const totalAmount = sendAmount + fee;

    setCalculation({
      receiveAmount,
      exchangeRate: rate,
      transferFee: fee,
      totalAmount
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecipientSelect = (recipientId: string) => {
    const recipient = recipients.find((r: any) => r.id === recipientId);
    if (recipient) {
      setFormData(prev => ({
        ...prev,
        recipientName: recipient.full_name,
        recipientPhone: recipient.phone_number || '',
        recipientEmail: recipient.email || '',
        recipientCountry: recipient.country,
        recipientCity: recipient.city || '',
        recipientAddress: recipient.address || '',
        bankName: recipient.bank_name || '',
        accountNumber: recipient.account_number || ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    try {
      // Create recipient if new
      let recipientId = null;
      const existingRecipient = recipients.find((r: any) => 
        r.full_name === formData.recipientName && r.country === formData.recipientCountry
      );

      if (existingRecipient) {
        recipientId = existingRecipient.id;
      } else {
        const { data: newRecipient, error: recipientError } = await supabase
          .from('transfer_recipients')
          .insert({
            full_name: formData.recipientName,
            phone_number: formData.recipientPhone,
            email: formData.recipientEmail,
            country: formData.recipientCountry,
            city: formData.recipientCity,
            address: formData.recipientAddress,
            bank_name: formData.bankName,
            account_number: formData.accountNumber
          })
          .select()
          .single();

        if (recipientError) throw recipientError;
        recipientId = newRecipient.id;
        await fetchRecipients();
      }

      // Create transfer
      const { error: transferError } = await supabase
        .from('money_transfers')
        .insert({
          recipient_id: recipientId,
          send_amount: parseFloat(formData.sendAmount),
          send_currency: formData.sendCurrency,
          receive_amount: calculation.receiveAmount,
          receive_currency: formData.receiveCurrency,
          exchange_rate: calculation.exchangeRate,
          transfer_fee: calculation.transferFee,
          total_amount: calculation.totalAmount,
          transfer_method: formData.transferMethod,
          purpose: formData.purpose,
          status: 'pending'
        });

      if (transferError) throw transferError;

      toast({
        title: "Transfer Initiated Successfully!",
        description: "Your money transfer has been submitted and is being processed.",
      });

      // Reset form
      setFormData({
        sendAmount: '',
        sendCurrency: 'UGX',
        receiveCurrency: 'USD',
        transferMethod: 'bank_transfer',
        purpose: '',
        recipientName: '',
        recipientPhone: '',
        recipientEmail: '',
        recipientCountry: '',
        recipientCity: '',
        recipientAddress: '',
        bankName: '',
        accountNumber: ''
      });
      setStep(1);

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="sendAmount">Send Amount</Label>
            <Input
              id="sendAmount"
              type="number"
              placeholder="0.00"
              value={formData.sendAmount}
              onChange={(e) => handleInputChange('sendAmount', e.target.value)}
              className="text-lg h-12"
            />
          </div>
          <div>
            <Label htmlFor="sendCurrency">From Currency</Label>
            <Select value={formData.sendCurrency} onValueChange={(value) => handleInputChange('sendCurrency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="receiveAmount">Recipient Gets</Label>
            <Input
              id="receiveAmount"
              type="text"
              value={calculation.receiveAmount.toFixed(2)}
              readOnly
              className="text-lg h-12 bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="receiveCurrency">To Currency</Label>
            <Select value={formData.receiveCurrency} onValueChange={(value) => handleInputChange('receiveCurrency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="transferMethod">Transfer Method</Label>
        <Select value={formData.transferMethod} onValueChange={(value) => handleInputChange('transferMethod', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="cash_pickup">Cash Pickup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="purpose">Purpose of Transfer</Label>
        <Select value={formData.purpose} onValueChange={(value) => handleInputChange('purpose', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family_support">Family Support</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.sendAmount && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Send Amount:</span>
                <span className="font-semibold">{formData.sendCurrency} {parseFloat(formData.sendAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span>1 {formData.sendCurrency} = {calculation.exchangeRate} {formData.receiveCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>Transfer Fee:</span>
                <span>{formData.sendCurrency} {calculation.transferFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold">{formData.sendCurrency} {calculation.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Recipient Gets:</span>
                <span className="font-bold text-green-600">{formData.receiveCurrency} {calculation.receiveAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {recipients.length > 0 && (
        <div>
          <Label>Select Existing Recipient (Optional)</Label>
          <Select onValueChange={handleRecipientSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose from saved recipients" />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((recipient: any) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  {recipient.full_name} - {recipient.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recipientName">Full Name *</Label>
          <Input
            id="recipientName"
            value={formData.recipientName}
            onChange={(e) => handleInputChange('recipientName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="recipientPhone">Phone Number</Label>
          <Input
            id="recipientPhone"
            value={formData.recipientPhone}
            onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recipientEmail">Email Address</Label>
          <Input
            id="recipientEmail"
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recipientCountry">Country *</Label>
          <Select value={formData.recipientCountry} onValueChange={(value) => handleInputChange('recipientCountry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Uganda">Uganda</SelectItem>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="Tanzania">Tanzania</SelectItem>
              <SelectItem value="Rwanda">Rwanda</SelectItem>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recipientCity">City</Label>
          <Input
            id="recipientCity"
            value={formData.recipientCity}
            onChange={(e) => handleInputChange('recipientCity', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recipientAddress">Address</Label>
          <Input
            id="recipientAddress"
            value={formData.recipientAddress}
            onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
          />
        </div>
      </div>

      {formData.transferMethod === 'bank_transfer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              required
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Transfer Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Transfer Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Send Amount:</span>
                  <span>{formData.sendCurrency} {parseFloat(formData.sendAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transfer Fee:</span>
                  <span>{formData.sendCurrency} {calculation.transferFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>{formData.sendCurrency} {calculation.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Recipient Gets:</span>
                  <span>{formData.receiveCurrency} {calculation.receiveAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recipient Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {formData.recipientName}</p>
                <p><strong>Country:</strong> {formData.recipientCountry}</p>
                <p><strong>Method:</strong> {formData.transferMethod.replace('_', ' ').toUpperCase()}</p>
                {formData.transferMethod === 'bank_transfer' && (
                  <>
                    <p><strong>Bank:</strong> {formData.bankName}</p>
                    <p><strong>Account:</strong> {formData.accountNumber}</p>
                  </>
                )}
                <p><strong>Purpose:</strong> {formData.purpose.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Shield className="h-6 w-6 text-yellow-600" />
        <div className="text-sm">
          <p className="font-semibold text-yellow-800">Security Notice</p>
          <p className="text-yellow-700">Please verify all details are correct before confirming the transfer.</p>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Money - Step {step} of 3
        </CardTitle>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                i <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.sendAmount}
            className="ml-auto"
          >
            {isLoading ? 'Processing...' : step === 3 ? 'Confirm Transfer' : 'Next'}
            {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendMoneyForm;
