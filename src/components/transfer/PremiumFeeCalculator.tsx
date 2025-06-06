
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp, Info, ArrowUpDown } from 'lucide-react';

interface PremiumFeeCalculatorProps {
  exchangeRates: any[];
}

const PremiumFeeCalculator: React.FC<PremiumFeeCalculatorProps> = ({ exchangeRates }) => {
  const [sendAmount, setSendAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('UGX');
  const [transferMethod, setTransferMethod] = useState('bank_transfer');
  const [calculation, setCalculation] = useState({
    receiveAmount: 0,
    exchangeRate: 0,
    serviceFee: 0,
    totalCost: 0,
    goldCharpFee: 0
  });

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

  const transferMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', fee: 0.15 },
    { value: 'mobile_money', label: 'Mobile Money', fee: 0.18 },
    { value: 'cash_pickup', label: 'Cash Pickup', fee: 0.22 }
  ];

  const handleCurrencyFlip = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  useEffect(() => {
    if (sendAmount && exchangeRates.length > 0) {
      calculateFees();
    }
  }, [sendAmount, fromCurrency, toCurrency, transferMethod, exchangeRates]);

  const calculateFees = () => {
    const amount = parseFloat(sendAmount);
    if (!amount || fromCurrency === toCurrency) return;

    // Find exchange rate
    const rate = exchangeRates.find(r => 
      r.from_currency === fromCurrency && 
      r.to_currency === toCurrency
    )?.rate || 1;

    // Calculate Gold Charp's 20% service fee
    const goldCharpFeeRate = 0.20; // 20%
    const goldCharpFee = amount * goldCharpFeeRate;

    // Additional transfer method fee
    const methodFee = transferMethods.find(m => m.value === transferMethod)?.fee || 0.15;
    const transferFee = amount * methodFee;

    const totalServiceFee = goldCharpFee + transferFee;
    const receiveAmount = amount * rate;
    const totalCost = amount + totalServiceFee;

    setCalculation({
      receiveAmount,
      exchangeRate: rate,
      serviceFee: totalServiceFee,
      totalCost,
      goldCharpFee
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="premium-card">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-6 w-6" />
            Premium Fee Calculator
          </CardTitle>
          <p className="text-purple-100">Calculate exact costs for your international transfer</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="sendAmount" className="text-sm font-semibold">Send Amount</Label>
              <Input
                id="sendAmount"
                type="number"
                placeholder="1000"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="premium-input h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">From Currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="premium-input h-12">
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

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCurrencyFlip}
                className="h-12 w-12 rounded-full hover:bg-purple-50 border-purple-300"
                title="Swap currencies"
              >
                <ArrowUpDown className="h-4 w-4 text-purple-600" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">To Currency</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="premium-input h-12">
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

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Transfer Method</Label>
              <Select value={transferMethod} onValueChange={setTransferMethod}>
                <SelectTrigger className="premium-input h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transferMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{method.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {(method.fee * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Section */}
          {sendAmount && fromCurrency !== toCurrency && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Main Calculation Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-300">Recipient Receives</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">After all fees</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {currencies.find(c => c.code === toCurrency)?.symbol} {calculation.receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Exchange Rate</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Live rate</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      {calculation.exchangeRate.toFixed(4)}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      1 {fromCurrency} = {calculation.exchangeRate.toFixed(4)} {toCurrency}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Fee Breakdown */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                    <Info className="h-5 w-5" />
                    Fee Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Send Amount:</span>
                        <span className="font-semibold">{currencies.find(c => c.code === fromCurrency)?.symbol} {parseFloat(sendAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gold Charp Fee (20%):</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {currencies.find(c => c.code === fromCurrency)?.symbol} {calculation.goldCharpFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Transfer Fee:</span>
                        <span className="font-semibold">
                          {currencies.find(c => c.code === fromCurrency)?.symbol} {(calculation.serviceFee - calculation.goldCharpFee).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Fees:</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {currencies.find(c => c.code === fromCurrency)?.symbol} {calculation.serviceFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-semibold">Total Cost:</span>
                        <span className="font-bold text-lg">
                          {currencies.find(c => c.code === fromCurrency)?.symbol} {calculation.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2">Contact Gold Charp</h4>
                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p>📞 +256-393103974</p>
                        <p>📞 +256-790501202</p>
                        <p>📞 +256-200943073</p>
                        <p>📧 info@goldcharpinvestments.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Same Currency Warning */}
          {fromCurrency === toCurrency && (
            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">Please select different currencies to calculate transfer fees.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumFeeCalculator;
