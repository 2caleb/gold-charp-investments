
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartDataQualityIndicatorProps {
  dataQualityScore: number;
  hasIssues: boolean;
  totalLoans: number;
  reliableLoans: number;
  loansNeedingAttention: number;
}

const SmartDataQualityIndicator: React.FC<SmartDataQualityIndicatorProps> = ({
  dataQualityScore,
  hasIssues,
  totalLoans,
  reliableLoans,
  loansNeedingAttention
}) => {
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />;
    if (score >= 75) return <Info className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className={`${getQualityColor(dataQualityScore)} border-2`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm">
            {getQualityIcon(dataQualityScore)}
            <span className="ml-2">Smart Data Quality Monitor</span>
            <Badge variant="outline" className="ml-auto">
              {dataQualityScore.toFixed(1)}% Quality Score
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-semibold">{reliableLoans}/{totalLoans}</p>
              <p className="text-xs opacity-75">Reliable Records</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{loansNeedingAttention}</p>
              <p className="text-xs opacity-75">Need Attention</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{hasIssues ? 'Issues Found' : 'All Good'}</p>
              <p className="text-xs opacity-75">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartDataQualityIndicator;
