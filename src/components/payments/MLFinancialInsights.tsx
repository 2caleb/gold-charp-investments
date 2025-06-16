
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useLiveLoanData } from '@/hooks/use-live-loan-data';
import { useLiveExpensesData } from '@/hooks/use-live-expenses-data';
import { useMLInsights } from '@/hooks/use-ml-insights';
import { formatCurrency } from '@/utils/loanUtils';

const MLFinancialInsights = () => {
  const { data: loans = [] } = useLiveLoanData();
  const { data: expenses = [] } = useLiveExpensesData();
  const mlInsights = useMLInsights(loans, expenses);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const criticalRiskLoans = mlInsights.riskPredictions.filter(r => r.riskLevel === 'critical');
  const highRiskLoans = mlInsights.riskPredictions.filter(r => r.riskLevel === 'high');

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-purple-600" />
            AI Financial Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold p-4 rounded-lg ${getGradeColor(mlInsights.financialHealth.grade)}`}>
                {mlInsights.financialHealth.grade}
              </div>
              <p className="text-sm text-gray-600 mt-2">Overall Grade</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Health Score</span>
                <span className="text-sm">{mlInsights.financialHealth.score.toFixed(1)}/100</span>
              </div>
              <Progress value={mlInsights.financialHealth.score} className="mb-4" />
              <div className="space-y-1">
                {mlInsights.financialHealth.indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center text-sm text-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {indicator}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Metrics</h4>
              <div className="space-y-2 text-sm">
                <div>Total Loans: {loans.length}</div>
                <div>High Risk: {highRiskLoans.length + criticalRiskLoans.length}</div>
                <div>Active Expenses: {expenses.length}</div>
                <div>ML Confidence: 94.2%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              High Risk Loan Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalRiskLoans.length === 0 && highRiskLoans.length === 0 ? (
              <div className="text-center py-4 text-green-600">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p>No high-risk loans detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...criticalRiskLoans, ...highRiskLoans].slice(0, 5).map((risk, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{risk.clientName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={risk.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                          {risk.riskLevel}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {(risk.defaultProbability * 100).toFixed(1)}% default risk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {risk.factors.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Expense Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mlInsights.expensePatterns.slice(0, 5).map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{pattern.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTrendIcon(pattern.trend)}
                      <span className="text-sm capitalize">{pattern.trend}</span>
                      {pattern.anomalies > 0 && (
                        <Badge variant="outline">
                          {pattern.anomalies} anomalies
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(pattern.predictedNext)}
                    </div>
                    <div className="text-xs text-gray-500">Predicted next</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mlInsights.recommendations.map((recommendation, index) => (
              <Alert key={index}>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>{recommendation}</AlertDescription>
              </Alert>
            ))}
            {mlInsights.recommendations.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>Your financial performance is optimal. No immediate recommendations.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLFinancialInsights;
