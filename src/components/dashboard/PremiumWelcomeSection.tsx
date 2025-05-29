
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePremiumUser } from '@/hooks/use-premium-user';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Clock } from 'lucide-react';

const PremiumWelcomeSection = () => {
  const { profile, isLoading } = usePremiumUser();
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'ceo': return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'director': return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'manager': return 'bg-gradient-to-r from-emerald-600 to-green-600';
      case 'chairperson': return 'bg-gradient-to-r from-amber-600 to-orange-600';
      case 'field_officer': return 'bg-gradient-to-r from-teal-600 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-600 to-slate-600';
    }
  };

  const getRoleIcon = (role: string) => {
    if (['ceo', 'director', 'chairperson'].includes(role?.toLowerCase())) {
      return <Crown className="h-4 w-4" />;
    }
    return <Sparkles className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-none shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-16 h-16 ${getRoleColor(profile?.role || '')} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {profile?.initials || 'U'}
              </motion.div>
              
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900 mb-1"
                >
                  {getGreeting()}, {profile?.full_name || 'User'}!
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  <Badge 
                    className={`${getRoleColor(profile?.role || '')} text-white border-none px-3 py-1 flex items-center space-x-1`}
                  >
                    {getRoleIcon(profile?.role || '')}
                    <span className="font-medium">{profile?.roleDisplayName || 'User'}</span>
                  </Badge>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentTime}
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden md:flex flex-col items-end text-right"
            >
              <p className="text-lg font-semibold text-gray-700">
                Gold Charp Investments
              </p>
              <p className="text-sm text-gray-500">
                Premium Financial Dashboard
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumWelcomeSection;
