
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  Send, 
  CreditCard, 
  MapPin, 
  Phone,
  User,
  DollarSign,
  ArrowRight,
  Shield,
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface SendMoneyFormProps {
  exchangeRates?: any[];
}

const SendMoneyForm: React.FC<SendMoneyFormProps> = ({ exchangeRates = [] }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    senderPhone: '',
    receiverPhone: '',
    recipientName: '',
    recipientCountry: 'Uganda',
    sendAmount: '',
    sendCurrency: 'UGX',
    receiveCurrency: 'USD',
    transferMethod: 'bank_transfer',
    purpose: '',
    bankCode: '',
    accountNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);

  const currencies = [
    { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', symbol: 'UGX' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', symbol: 'R' },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', symbol: 'KSh' },
    { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', symbol: 'TSh' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'CHF' }
  ];

  const supportedCountries = [
    { code: 'UG', name: 'Uganda', currency: 'UGX' },
    { code: 'US', name: 'USA', currency: 'USD' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'EU', name: 'European Union', currency: 'EUR' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF' }
  ];

  const transferMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
    { value: 'mobile_money', label: 'Mobile Money', icon: Phone },
    { value: 'cash_pickup', label: 'Cash Pickup', icon: MapPin }
  ];

  const handleCurrencyFlip = () => {
    setFormData(prev => ({
      ...prev,
      sendCurrency: prev.receiveCurrency,
      receiveCurrency: prev.sendCurrency
    }));
    // Clear calculation when currencies are flipped
    setCalculationResult(null);
  };

  const calculateTransfer = () => {
    const sendAmount = parseFloat(formData.sendAmount);
    if (!sendAmount || sendAmount <= 0) return;

    // Prevent same currency calculation
    if (formData.sendCurrency === formData.receiveCurrency) {
      toast({
        title: "Invalid Currency Selection",
        description: "Please select different currencies for send and receive",
        variant: "destructive"
      });
      return;
    }

    // Find exchange rate
    const rate = exchangeRates.find(r => 
      r.from_currency === formData.sendCurrency && 
      r.to_currency === formData.receiveCurrency
    )?.rate || 1;

    // Calculate fees (simplified - in production, get from transfer_fees table)
    const feePercentage = formData.transferMethod === 'bank_transfer' ? 2.0 : 
                         formData.transferMethod === 'mobile_money' ? 1.5 : 1.8;
    const fixedFee = formData.sendCurrency === 'UGX' ? 20000 : 
                    formData.sendCurrency === 'USD' ? 12 : 40;
    
    const transferFee = (sendAmount * feePercentage / 100) + fixedFee;
    const totalAmount = sendAmount + transferFee;
    const receiveAmount = sendAmount * rate;

    setCalculationResult({
      sendAmount,
      transferFee,
      totalAmount,
      receiveAmount,
      exchangeRate: rate,
      estimatedDelivery: formData.transferMethod === 'cash_pickup' ? 'Instant' : 
                        formData.transferMethod === 'mobile_money' ? '5-10 minutes' : '1-3 business days'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculationResult) {
      toast({
        title: "Error",
        description: "Please calculate the transfer first",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create recipient first
      const { data: recipient, error: recipientError } = await supabase
        .from('transfer_recipients')
        .insert({
          full_name: formData.recipientName,
          country: formData.recipientCountry,
          phone_number: formData.receiverPhone,
          account_number: formData.accountNumber,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (recipientError) throw recipientError;

      // Create transfer record
      const { data: transfer, error: transferError } = await supabase
        .from('money_transfers')
        .insert({
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          sender_phone: formData.senderPhone,
          receiver_phone: formData.receiverPhone,
          recipient_id: recipient.id,
          send_amount: calculationResult.sendAmount,
          send_currency: formData.sendCurrency,
          receive_amount: calculationResult.receiveAmount,
          receive_currency: formData.receiveCurrency,
          exchange_rate: calculationResult.exchangeRate,
          transfer_fee: calculationResult.transferFee,
          total_amount: calculationResult.totalAmount,
          transfer_method: formData.transferMethod,
          purpose: formData.purpose,
          estimated_delivery: new Date(Date.now() + (formData.transferMethod === 'cash_pickup' ? 0 : 24 * 60 * 60 * 1000)).toISOString()
        })
        .select()
        .single();

      if (transferError) throw transferError;

      // Process with Flutterwave
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-money-transfer', {
        body: {
          transferData: {
            transferId: transfer.id,
            referenceNumber: transfer.reference_number,
            sendAmount: calculationResult.sendAmount,
            sendCurrency: formData.sendCurrency,
            receiveAmount: calculationResult.receiveAmount,
            receiveCurrency: formData.receiveCurrency,
            recipientName: formData.recipientName,
            accountNumber: formData.accountNumber,
            bankCode: formData.bankCode,
            purpose: formData.purpose
          }
        }
      });

      if (processError) throw processError;

      toast({
        title: "Transfer Initiated Successfully!",
        description: `Reference: ${transfer.reference_number}. You will receive updates via SMS.`,
      });

      // Reset form
      setFormData({
        senderPhone: '',
        receiverPhone: '',
        recipientName: '',
        recipientCountry: 'Uganda',
        sendAmount: '',
        sendCurrency: 'UGX',
        receiveCurrency: 'USD',
        transferMethod: 'bank_transfer',
        purpose: '',
        bankCode: '',
        accountNumber: ''
      });
      setCalculationResult(null);

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred while processing your transfer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="shadow-xl border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Send className="mr-3 h-6 w-6" />
              Send Money Globally
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderPhone" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Your Phone Number
                  </Label>
                  <Input
                    id="senderPhone"
                    type="tel"
                    placeholder="+256700000000"
                    value={formData.senderPhone}
                    onChange={(e) => setFormData({...formData, senderPhone: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="receiverPhone" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Receiver's Phone Number
                  </Label>
                  <Input
                    id="receiverPhone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Recipient Name
                  </Label>
                  <Input
                    id="recipientName"
                    placeholder="Full name as on ID"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientCountry">Recipient Country</Label>
                  <Select value={formData.recipientCountry} onValueChange={(value) => setFormData({...formData, recipientCountry: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCountries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name} ({country.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Transfer Amount with Currency Flip */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="sendAmount" className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Send Amount
                    </Label>
                    <Input
                      id="sendAmount"
                      type="number"
                      placeholder="0.00"
                      value={formData.sendAmount}
                      onChange={(e) => setFormData({...formData, sendAmount: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Currency Selection with Flip Button */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="sendCurrency">From Currency</Label>
                    <Select value={formData.sendCurrency} onValueChange={(value) => setFormData({...formData, sendCurrency: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code} - {currency.name}</span>
                              <span className="text-gray-500">({currency.symbol})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCurrencyFlip}
                      className="h-10 w-10 rounded-full hover:bg-purple-50 border-purple-300"
                      title="Swap currencies"
                    >
                      <ArrowUpDown className="h-4 w-4 text-purple-600" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="receiveCurrency">To Currency</Label>
                    <Select value={formData.receiveCurrency} onValueChange={(value) => setFormData({...formData, receiveCurrency: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code} - {currency.name}</span>
                              <span className="text-gray-500">({currency.symbol})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Transfer Method */}
              <div>
                <Label>Transfer Method</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {transferMethods.map((method) => (
                    <div
                      key={method.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.transferMethod === method.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setFormData({...formData, transferMethod: method.value})}
                    >
                      <method.icon className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-center font-medium">{method.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Details (if bank transfer) */}
              {formData.transferMethod === 'bank_transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankCode">Bank Code</Label>
                    <Input
                      id="bankCode"
                      placeholder="e.g., 044 for Access Bank"
                      value={formData.bankCode}
                      onChange={(e) => setFormData({...formData, bankCode: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Recipient's account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div>
                <Label htmlFor="purpose">Purpose of Transfer</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., Family support, Business payment, etc."
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculateTransfer}
                  disabled={!formData.sendAmount || formData.sendCurrency === formData.receiveCurrency}
                  className="flex-1"
                >
                  Calculate Transfer
                </Button>
                <Button
                  type="submit"
                  disabled={!calculationResult || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? 'Processing...' : 'Send Money'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transfer Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {calculationResult && (
          <Card className="shadow-xl border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Transfer Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Send Amount:</span>
                <span className="font-semibold text-sm sm:text-base break-words text-right min-w-0">{calculationResult.sendAmount.toLocaleString()} {formData.sendCurrency}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Transfer Fee:</span>
                <span className="font-semibold text-sm sm:text-base break-words text-right min-w-0">{calculationResult.transferFee.toLocaleString()} {formData.sendCurrency}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Total Amount:</span>
                <span className="font-bold text-base sm:text-lg break-words text-right min-w-0">{calculationResult.totalAmount.toLocaleString()} {formData.sendCurrency}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Exchange Rate:</span>
                <span className="font-semibold text-xs sm:text-sm break-words text-right min-w-0">1 {formData.sendCurrency} = {calculationResult.exchangeRate} {formData.receiveCurrency}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Recipient Gets:</span>
                <span className="font-bold text-base sm:text-lg text-green-600 break-words text-right min-w-0">{calculationResult.receiveAmount.toLocaleString()} {formData.receiveCurrency}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Delivery Time:
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {calculationResult.estimatedDelivery}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Features */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5 text-green-600" />
              Secure & Trusted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Bank-level encryption
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Licensed money transfer operator
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Real-time transaction tracking
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              24/7 customer support
            </div>
          </CardContent>
        </Card>

        {/* Updated Gold Charp Contact Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MapPin className="mr-2 h-5 w-5 text-purple-600" />
              Gold Charp Office Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">Gold Charp Financial Services</p>
              <p className="text-sm text-gray-600">Nansana Heights, Wakiso District</p>
              <p className="text-sm text-gray-600">Central Region, Uganda</p>
              <p className="text-sm text-gray-600">Business Hours: Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p className="text-sm text-gray-600">Saturday: 9:00 AM - 4:00 PM</p>
              <p className="text-sm text-gray-600">Sunday: Closed</p>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">📞 Phone: +256-393103974, +256-790501202, +256-200943073</p>
                <p className="text-sm text-gray-600">📧 Email: info@goldcharpinvestments.com</p>
                <p className="text-sm text-gray-600">🌐 Website: www.goldcharpinvestments.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SendMoneyForm;
