
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle, Clock, TrendingUp, Calculator, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartSummaryCardsProps {
  // Reliable calculations (excluding low-confidence data)
  reliableTotalLoaned: number;
  reliableTotalPaid: number;
  reliableTotalRemaining: number;
  reliableCollectionRate: number;
  
  // Data quality metrics
  totalLoans: number;
  reliableLoans: number;
  averageCollectionEfficiency: number;
  dataQualityScore: number;
}

const SmartSummaryCards: React.FC<SmartSummaryCardsProps> = ({
  reliableTotalLoaned,
  reliableTotalPaid,
  reliableTotalRemaining,
  reliableCollectionRate,
  totalLoans,
  reliableLoans,
  averageCollectionEfficiency,
  dataQualityScore
}) => {
  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-700">Smart Portfolio</p>
                <p className="text-sm font-bold">{formatCurrency(reliableTotalLoaned)}</p>
                <p className="text-xs text-blue-600">{reliableLoans}/{totalLoans} reliable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-green-700">Smart Collected</p>
                <p className="text-sm font-bold">{formatCurrency(reliableTotalPaid)}</p>
                <p className="text-xs text-green-600">{reliableCollectionRate.toFixed(1)}% rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-orange-700">Smart Outstanding</p>
                <p className="text-sm font-bold">{formatCurrency(reliableTotalRemaining)}</p>
                <p className="text-xs text-orange-600">Calculated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-purple-700">Collection Efficiency</p>
                <p className="text-sm font-bold">{averageCollectionEfficiency.toFixed(1)}%</p>
                <p className="text-xs text-purple-600">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-teal-600" />
              <div>
                <p className="text-xs text-teal-700">Auto-Calculations</p>
                <p className="text-sm font-bold">Smart Mode</p>
                <p className="text-xs text-teal-600">Always Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className={`bg-gradient-to-br border-2 ${
          dataQualityScore >= 90 ? 'from-green-50 to-green-100 border-green-200' :
          dataQualityScore >= 75 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
          'from-red-50 to-red-100 border-red-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className={`h-4 w-4 ${
                dataQualityScore >= 90 ? 'text-green-600' :
                dataQualityScore >= 75 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <div>
                <p className={`text-xs ${
                  dataQualityScore >= 90 ? 'text-green-700' :
                  dataQualityScore >= 75 ? 'text-yellow-700' :
                  'text-red-700'
                }`}>Data Quality</p>
                <p className="text-sm font-bold">{dataQualityScore.toFixed(1)}%</p>
                <p className={`text-xs ${
                  dataQualityScore >= 90 ? 'text-green-600' :
                  dataQualityScore >= 75 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SmartSummaryCards;
