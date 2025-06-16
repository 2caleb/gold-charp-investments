
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Sun, Calendar as CalendarIcon } from 'lucide-react';
import { useExpenseDailySummaries, useExpenseSmartCalculations } from '@/hooks/use-expense-clustering';
import { formatCurrency } from '@/utils/loanUtils';

const DailyExpenseAnalytics = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const { data: dailySummaries, isLoading: dailyLoading } = useExpenseDailySummaries();
  const { data: smartCalculations, isLoading: calculationsLoading } = useExpenseSmartCalculations(
    new Date(selectedDate).getMonth() + 1,
    new Date(selectedDate).getFullYear(),
    'daily_analysis'
  );

  // Get day names
  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  // Today's analysis
  const todayAnalysis = smartCalculations?.find(calc => 
    calc.calculation_type === 'daily_analysis' && 
    new Date(calc.created_at).toDateString() === new Date(selectedDate).toDateString()
  );

  const todayExpenses = todayAnalysis?.calculation_data?.total_daily_expenses || 0;
  const averageDailyExpenses = todayAnalysis?.calculation_data?.average_daily_expenses || 0;
  const variancePercentage = todayAnalysis?.calculation_data?.variance_percentage || 0;
  const weekdayAverage = todayAnalysis?.calculation_data?.weekday_average || 0;
  const weekendAverage = todayAnalysis?.calculation_data?.weekend_average || 0;
  const dayOfWeek = todayAnalysis?.calculation_data?.day_of_week || new Date(selectedDate).getDay();

  // Recent days data
  const recentDays = dailySummaries?.slice(0, 7) || [];
  
  // Calculate daily trend
  const dailyTrend = recentDays.length >= 2 ? 
    ((recentDays[0]?.total_amount || 0) - (recentDays[1]?.total_amount || 0)) : 0;

  // Group by day of week for pattern analysis
  const dayOfWeekPattern = dailySummaries?.reduce((acc, summary) => {
    const day = summary.day_of_week;
    if (!acc[day]) {
      acc[day] = { total: 0, count: 0, average: 0 };
    }
    acc[day].total += summary.total_amount;
    acc[day].count += 1;
    acc[day].average = acc[day].total / acc[day].count;
    return acc;
  }, {} as Record<number, { total: number; count: number; average: number }>) || {};

  // Top spending categories today
  const todayCategories = dailySummaries?.filter(summary => 
    summary.expense_date === selectedDate
  ).sort((a, b) => b.total_amount - a.total_amount).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header with Date Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Daily Expense Analytics</h3>
          <p className="text-muted-foreground">Real-time daily spending insights and patterns</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Key Daily Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Total</p>
                <p className="text-2xl font-bold">{formatCurrency(todayExpenses)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-muted-foreground">
                {getDayName(dayOfWeek)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">30-Day Average</p>
                <p className="text-2xl font-bold">{formatCurrency(averageDailyExpenses)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
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
                <p className="text-sm font-medium text-muted-foreground">Daily Trend</p>
                <p className="text-2xl font-bold">{formatCurrency(Math.abs(dailyTrend))}</p>
              </div>
              {dailyTrend >= 0 ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
            <div className="mt-2">
              <Badge variant={dailyTrend >= 0 ? "destructive" : "secondary"}>
                {dailyTrend >= 0 ? 'Higher' : 'Lower'} than yesterday
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {dayOfWeek === 0 || dayOfWeek === 6 ? 'Weekend' : 'Weekday'} Avg
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(dayOfWeek === 0 || dayOfWeek === 6 ? weekendAverage : weekdayAverage)}
                </p>
              </div>
              <Sun className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Contextual baseline</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown and Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-4 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentDays.map((day) => (
                  <div key={day.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">
                        {new Date(day.expense_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getDayName(day.day_of_week)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(day.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.transaction_count} transactions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 7 }, (_, i) => {
                const dayData = dayOfWeekPattern[i];
                const maxAverage = Math.max(...Object.values(dayOfWeekPattern).map(d => d?.average || 0));
                
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getDayName(i)}</span>
                      <span className="text-sm">
                        {dayData ? formatCurrency(dayData.average) : 'No data'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: dayData && maxAverage > 0 ? 
                            `${Math.min((dayData.average / maxAverage) * 100, 100)}%` : '0%'
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dayData ? `${dayData.count} days tracked` : 'No transactions'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayCategories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{category.category}</h4>
                  <Badge variant="outline">{category.account}</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(category.total_amount)}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                  <span>{category.transaction_count} transactions</span>
                  <span>Avg: {formatCurrency(category.average_amount)}</span>
                </div>
              </div>
            ))}
          </div>
          {todayCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded for this date</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Insights */}
      {todayAnalysis?.insights && todayAnalysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAnalysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyExpenseAnalytics;
