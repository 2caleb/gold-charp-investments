
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Calendar, BarChart3, Lightbulb, AlertTriangle, CheckCircle, Sun } from 'lucide-react';
import { useExpenseWeeklySummaries, useExpenseMonthlySummaries, useExpenseSmartCalculations, triggerExpenseClustering } from '@/hooks/use-expense-clustering';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/loanUtils';
import DailyExpenseAnalytics from './DailyExpenseAnalytics';

const SmartExpenseAnalytics = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { data: weeklySummaries, isLoading: weeklyLoading } = useExpenseWeeklySummaries();
  const { data: monthlySummaries, isLoading: monthlyLoading } = useExpenseMonthlySummaries(selectedMonth, selectedYear);
  const { data: smartCalculations, isLoading: calculationsLoading } = useExpenseSmartCalculations(selectedMonth, selectedYear);

  const handleManualClustering = async () => {
    try {
      await triggerExpenseClustering();
      toast({
        title: 'Clustering Complete',
        description: 'Expense data has been recalculated and updated',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Clustering Failed',
        description: 'Unable to update expense clustering',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Current month analysis
  const currentMonthAnalysis = smartCalculations?.find(calc => calc.calculation_type === 'monthly_analysis');
  const totalMonthlyExpenses = currentMonthAnalysis?.calculation_data?.total_monthly_expenses || 0;
  const averageMonthlyExpenses = currentMonthAnalysis?.calculation_data?.average_monthly_expenses || 0;
  const variancePercentage = currentMonthAnalysis?.calculation_data?.variance_percentage || 0;

  // Weekly trends
  const recentWeeks = weeklySummaries?.slice(0, 4) || [];
  const weeklyTrend = recentWeeks.length >= 2 ? 
    ((recentWeeks[0]?.total_amount || 0) - (recentWeeks[1]?.total_amount || 0)) : 0;

  // Category breakdown
  const categoryBreakdown = monthlySummaries?.reduce((acc, summary) => {
    if (!acc[summary.category]) {
      acc[summary.category] = {
        total: 0,
        growth: 0,
        accounts: 0
      };
    }
    acc[summary.category].total += summary.total_amount;
    acc[summary.category].growth += summary.growth_percentage;
    acc[summary.category].accounts += 1;
    return acc;
  }, {} as Record<string, { total: number; growth: number; accounts: number }>) || {};

  // Top categories by spending
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Expense Analytics</h2>
          <p className="text-muted-foreground">AI-powered expense clustering and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem key={2020 + i} value={(2020 + i).toString()}>
                  {2020 + i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleManualClustering} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyExpenses)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center">
              {variancePercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${variancePercentage >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.abs(variancePercentage).toFixed(1)}% vs avg
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">6-Month Average</p>
                <p className="text-2xl font-bold">{formatCurrency(averageMonthlyExpenses)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Baseline comparison</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Trend</p>
                <p className="text-2xl font-bold">{formatCurrency(Math.abs(weeklyTrend))}</p>
              </div>
              {weeklyTrend >= 0 ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
            <div className="mt-2">
              <Badge variant={weeklyTrend >= 0 ? "destructive" : "secondary"}>
                {weeklyTrend >= 0 ? 'Increasing' : 'Decreasing'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analysis Score</p>
                <p className="text-2xl font-bold">{currentMonthAnalysis?.confidence_score || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Confidence level</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Analysis</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <DailyExpenseAnalytics />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-4 rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlySummaries?.map((summary) => (
                      <div key={summary.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{summary.category}</p>
                          <p className="text-sm text-muted-foreground">{summary.account}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(summary.total_amount)}</p>
                          <div className="flex items-center">
                            {summary.growth_percentage >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                            )}
                            <span className={`text-xs ${summary.growth_percentage >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {Math.abs(summary.growth_percentage).toFixed(1)}%
                            </span>
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
                <CardTitle>Growth Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm">{formatCurrency(data.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((data.total / (topCategories[0]?.[1]?.total || 1)) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{data.accounts} accounts</span>
                        <span className={data.growth >= 0 ? 'text-red-500' : 'text-green-500'}>
                          {data.growth.toFixed(1)}% growth
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-4 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentWeeks.map((week) => (
                    <div key={week.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          Week {week.week_number}, {week.year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(week.week_start_date).toLocaleDateString()} - 
                          {new Date(week.week_end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(week.total_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {week.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calculationsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-4 rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentMonthAnalysis?.insights?.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{insight}</p>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No insights available for this period.</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentMonthAnalysis?.recommendations?.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recommendations available for this period.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{category}</h4>
                      <Badge variant={data.growth >= 0 ? "destructive" : "secondary"}>
                        {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-bold">{formatCurrency(data.total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Accounts</p>
                        <p className="font-bold">{data.accounts}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg per Account</p>
                        <p className="font-bold">{formatCurrency(data.total / data.accounts)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartExpenseAnalytics;
