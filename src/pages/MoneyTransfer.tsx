
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  Send, 
  CreditCard, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Globe,
  Shield,
  ArrowRight,
  Calculator
} from 'lucide-react';
import SendMoneyForm from '@/components/transfer/SendMoneyForm';
import TransferHistory from '@/components/transfer/TransferHistory';
import ExchangeRateCalculator from '@/components/transfer/ExchangeRateCalculator';
import AgentLocator from '@/components/transfer/AgentLocator';

const MoneyTransfer = () => {
  // Fetch user's transfer history
  const { data: transferHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['user-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('money_transfers')
        .select(`
          *,
          transfer_recipients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transfers:', error);
        return [];
      }
      return data || [];
    },
  });

  // Fetch exchange rates
  const { data: exchangeRates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('effective_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching exchange rates:', error);
        return [];
      }
      return data || [];
    },
  });

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Reach",
      description: "Send money to USA, South Africa, and Uganda"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Safe",
      description: "Bank-level security with real-time fraud monitoring"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast Transfers",
      description: "Most transfers completed within minutes"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Multiple Options",
      description: "Bank transfer, mobile money, or cash pickup"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            International Money Transfer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Send money globally with competitive rates, fast delivery, and world-class security
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Main Transfer Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-14 mb-8">
              <TabsTrigger value="send" className="text-sm">
                <Send className="mr-2 h-4 w-4" />
                Send Money
              </TabsTrigger>
              <TabsTrigger value="history" className="text-sm">
                <Clock className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="calculator" className="text-sm">
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
              </TabsTrigger>
              <TabsTrigger value="agents" className="text-sm">
                <MapPin className="mr-2 h-4 w-4" />
                Agent Locator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send">
              <SendMoneyForm exchangeRates={exchangeRates} />
            </TabsContent>

            <TabsContent value="history">
              <TransferHistory transfers={transferHistory} isLoading={historyLoading} />
            </TabsContent>

            <TabsContent value="calculator">
              <ExchangeRateCalculator exchangeRates={exchangeRates} />
            </TabsContent>

            <TabsContent value="agents">
              <AgentLocator />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8"
        >
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Why Choose Gold Charp Money Transfer?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <p className="text-gray-600">Countries Served</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                <p className="text-gray-600">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <p className="text-gray-600">Customer Support</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default MoneyTransfer;
