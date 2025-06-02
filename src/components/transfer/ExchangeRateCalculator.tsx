
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface ExchangeRateCalculatorProps {
  exchangeRates: any[];
}

const ExchangeRateCalculator: React.FC<ExchangeRateCalculatorProps> = ({ exchangeRates }) => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('UGX');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState({
    convertedAmount: 0,
    exchangeRate: 0,
    lastUpdated: ''
  });

  const currencies = [
    { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' }
  ];

  useEffect(() => {
    calculateExchange();
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const calculateExchange = () => {
    if (!amount || !exchangeRates.length) return;

    const rate = exchangeRates.find(r => 
      r.from_currency === fromCurrency && r.to_currency === toCurrency
    );

    if (rate) {
      const convertedAmount = parseFloat(amount) * rate.rate;
      setResult({
        convertedAmount,
        exchangeRate: rate.rate,
        lastUpdated: new Date(rate.effective_date).toLocaleString()
      });
    } else {
      // If direct rate not found, try reverse rate
      const reverseRate = exchangeRates.find(r => 
        r.from_currency === toCurrency && r.to_currency === fromCurrency
      );
      
      if (reverseRate) {
        const rate = 1 / reverseRate.rate;
        const convertedAmount = parseFloat(amount) * rate;
        setResult({
          convertedAmount,
          exchangeRate: rate,
          lastUpdated: new Date(reverseRate.effective_date).toLocaleString()
        });
      } else {
        setResult({
          convertedAmount: 0,
          exchangeRate: 0,
          lastUpdated: ''
        });
      }
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'UGX' ? 0 : 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Exchange Rate Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg h-12"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>From Currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code} - {currency.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Currency</Label>
              <div className="flex gap-2">
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code} - {currency.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={swapCurrencies}
                  className="h-12 w-12 flex items-center justify-center border rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {result.exchangeRate > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(result.convertedAmount, toCurrency)}
                    </p>
                    <p className="text-gray-600">
                      {formatAmount(parseFloat(amount), fromCurrency)} equals
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      1 {fromCurrency} = {result.exchangeRate.toFixed(4)} {toCurrency}
                    </span>
                  </div>
                  
                  {result.lastUpdated && (
                    <p className="text-xs text-gray-500">
                      Last updated: {result.lastUpdated}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Live Exchange Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live Exchange Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exchangeRates.slice(0, 6).map((rate, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {rate.from_currency}/{rate.to_currency}
                  </span>
                  <span className="font-bold text-blue-600">
                    {rate.rate.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(rate.effective_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateCalculator;
