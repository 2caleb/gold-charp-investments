
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Globe, Shield, Clock, DollarSign, ArrowRight } from 'lucide-react';

const MoneyTransferHero = () => {
  const features = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Global Reach",
      description: "3+ Countries"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Secure",
      description: "Bank-level Security"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Fast",
      description: "Within Minutes"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Competitive",
      description: "Best Rates"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium"
              >
                <Send className="h-4 w-4 mr-2" />
                International Money Transfer
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                Send Money
                <span className="block text-gradient">Anywhere, Anytime</span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Transfer money globally with Gold Charp's premium international money transfer service. 
                Competitive rates, secure transactions, and lightning-fast delivery to the pearl of Africa.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2 text-purple-600 dark:text-purple-400">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/money-transfer">
                <Button size="lg" className="premium-button w-full sm:w-auto">
                  <Send className="mr-2 h-5 w-5" />
                  Send Money Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/money-transfer?tab=calculator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20">
                  Calculate Rates
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$10M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Transferred</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <Card className="premium-card p-8 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Transfer Preview</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">See how easy it is to send money</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">You Send</span>
                    <span className="font-semibold">$1,000 USD</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <span className="text-sm text-purple-600 dark:text-purple-400">They Receive</span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">3,700,000 UGX</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xs text-green-600 dark:text-green-400">Transfer Fee</div>
                      <div className="font-semibold text-green-700 dark:text-green-300">$25</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xs text-blue-600 dark:text-blue-400">Delivery Time</div>
                      <div className="font-semibold text-blue-700 dark:text-blue-300">5 minutes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MoneyTransferHero;
